

/*--- Sincronização do bot com o WhatsApp ---*/

const qrcode = require('qrcode-terminal')
const dotenv = require('dotenv')
const error = require('./error.js')
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const { getNickSOfMessage } = require('./arena_sc/getNickSOfMessage.js')
const { getTelefoneS } = require('./arena_sc/getTelefoneS.js')
const { contarUnicodeEmojis } = require('./arena_sc/contarUnicodeEmojis.js')
const { appendFile, readFile, writeFile } = require('./myfs.js') // const the functions
const { generateTable } = require('./arena_sc/generateTable.js')
const { getWinnersAndTheirFights } = require('./arena_sc/getWinnersAndTheirFights.js')
const { definir_winner } = require('./arena_sc/definir_winner.js')
const { calcularProximidade } = require('./arena_sc/calcularProximidade.js')

dotenv.config({ path: './.env' });

// Initialize ALL global variables with appropriate default values.
// It's crucial to initialize these outside the Comandos function
// so that their values are not reset every time Comandos is called.
let phoneS; let mensagem_anterior
let winner

// Create a new client instance
const client = new Client({ authStrategy: new LocalAuth() });

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Client is ready!');
    console.log(new Date().toLocaleTimeString());
});

// When the client received QR-Code
client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

async function menuCLI() {
    let a = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    let b = '1 - Enviar list de membros do Dragon Gakure\n> ';
    a.question(b, (input) => {
        console.log(`You entered: ${input}`);
        a.close();
    });
}

function removeFirst9After55(str) {
  if (str.startsWith("55") && str.length === 13) {
    const index = str.indexOf("9", 3); // Start searching from the third character (index 2)
    if (index !== -1) {
      return str.substring(0, index) + str.substring(index + 1);
    }
  }
  return str;
}

// Function to initialize data (nicks, telefones, etc.)
async function initializeData() {
    phoneS = await getTelefoneS()
}

initializeData()

// Função principal que rege todos os comandos
async function Comandos(message) {
    /*--- Comandos Ajuda ---*/
    let group_id_if_arena_sc_comandos; let group_if_arena_sc_comandos
    if (process.env.DEBUG) {
        group_id_if_arena_sc_comandos = process.env.TEST_GROUP
        group_if_arena_sc_comandos = 'TEST_GROUP'
    } else {
        group_id_if_arena_sc_comandos = process.env.ARENASC
        group_if_arena_sc_comandos = 'ARENASC'
    }
    if (message.from === group_id_if_arena_sc_comandos && message.body != '.tag') {
        // ARENA SC CONTAGEM DE LUTAS EM TEMPO REAL
        console.log('into comandos if arena sc')
        console.log('group onde will send =', group_if_arena_sc_comandos)
        console.log('group id =', group_id_if_arena_sc_comandos)
        console.log(`message.body:`, message.body)
        console.log(`message.from:`, message.from)
        console.log(`message.to:`, message.to)
        console.log(`message.fromMe:`, message.fromMe)
        console.log(`message.author:`, message.author)
        console.log(`message.timestamp:`, message.timestamp)
        console.log(`message.isGif:`, message.isGif)
        // console.log(`message.isGroupMsg:`, message.isGroupMsg)
        // console.log(`message.isMedia:`, message.isMedia)
        // console.log(`message.isNotification:`, message.isNotification)
        console.log(`\n.bool: ${message.from === process.env.TEST_GROUP}`);
        console.log(new Date().toLocaleTimeString());
        // process.stdout.write(' ', typeof String.raw`${message.body}`)

        winner = null
        let dataHoraUser = {  // Create the object
			data_hora: message.timestamp,
			usuario: message.author || message.from // Use author if available, otherwise from
		};

        //Regular expression matching numbers with 1 to 3 digits not surrounded by other digits
        const regex = /(?<!\d)[0-9]{1,3}(?!\d)/g;
        const numbers = message.body.match(regex) || [];
        process.stdout.write(`Extracted Numbers: ${numbers}.`);

        const nickSOfMessage = await getNickSOfMessage(message);
		const nick_count = nickSOfMessage.length; // Get nick_count here

        if (numbers.length < 4) {
            return
        } else if ( nick_count == 2) {
            const resultados = calcularProximidade(message.body, nickSOfMessage)
            // resultados = [ [ 'noelle', [ 0, 400 ] ], [ 'acácia', [ 200, 400 ] ] ]
            console.log(resultados)
            // let allStatuS = resultados[nickSOfMessage[0]]['status'].concat(resultados[nickSOfMessage[1]]['status'])
            // let resultsProcess = allStatuS.reduce((map) => { if (map.has(0)) { map.set(0, map.get(0) + 1); } else { map.set(0, 1); } return map; }, new Map())
            if (resultados.length == 0) {
            // if (resultados.length != 2) {
                error(message.body, '23', 'PARECE HAVER MAIS QUE 2 OU MENOS QUE 2 DE LINHAS QUE REPRESENTAM O STATUS DE LIFE E CHAKRA');
                return null; // Or handle the error differently
            }
            winner = definir_winner(message, nickSOfMessage, numbers, dataHoraUser, mensagem_anterior, resultados)
        } else if (nick_count === 1) {
            error(message.body, '0', `Pegar o nick da placa abaixo diferente do nick: ${nickSOfMessage[0]}`)
            return;
        
        } else if (nick_count === 0 && message.body && contarUnicodeEmojis(message.body) < 50) {
            // Handle the error (e.g., send a message, return) – don't just exit()
            error(message.body, 123658, `´${numbers}; ${dataHoraUser}`)
            return
        } else if (nick_count === 3 && nickSOfMessage.some(nick => nickSOfMessage.filter(n => n === nick).length > 1)) {
            error(message.body, '10', "Pode haver duas simplificações de nicks iguais. " + "Confira o arquivo de nicks.")
            console.error("\n\nID=10");
            console.error("Pode haver duas simplificações de nicks iguais.");
            console.error("Confira o arquivo de nicks.");
            console.error(`\nMENSAGEM:\n\n${message.body}\n`);
            // Handle the error as needed
            return
        }

        if (winner == null) {
            mensagem_anterior = message
            return
        }
        if (winner instanceof Promise) {
            winner = await winner;
        }

        let winners = await readFile(process.env.WINNERS_ARENA_SC)
        winners = JSON.parse(winners)
        //console.log('winners = ', winners)
        console.log('winner =', winner)
        const dataToAppend = {
            'winner': winner.toLowerCase(),
            'phone': phoneS[winner.toLowerCase()],
            'timestamp': message.timestamp,
            'author': message.author || message.from
        };
        console.log('dataToAppend = ', dataToAppend)
        winners.push(dataToAppend)
        //console.log('winners = ', winners)
        await writeFile(process.env.WINNERS_ARENA_SC, JSON.stringify(winners, null, 2)); // Correctly call using await

        let winnersAndTheirFights = await getWinnersAndTheirFights(winners)
        console.log(winnersAndTheirFights)
        let table = await generateTable(winnersAndTheirFights)

        console.log('Enviando mensagem.')
        await client.sendMessage(group_id_if_arena_sc_comandos, table)
        console.log('Mensagem enviada.')
    } else if (message.body.toLowerCase() === process.env.PREFIX + 'tag'.toLowerCase()) {
        // to tag _ marcar todos do grupo.
        if (message.author != process.env.OWNER_NUMBER || message.from != process.env.DRAGON_GAKURE) {
            return
        }
        const chat = await message.getChat();
        let mentions = [];
        let pessoas = ''
        for (let participantes of chat.participants) {
            mentions.push(`${participantes.id.user}@c.us`);
            pessoas += `|@${participantes.id.user} `;
            console.log(participantes);
        }
        // await chat.sendMessage(pessoas, {mentions});
        await chat.sendMessage('Leiam a mensagem acima.', {mentions});
    } else if (message.body.toLowerCase() === process.env.PREFIX + 'Dg'.toLowerCase()) {
        // enviar lista de membros do dragon no grupo que passo os contatos para thaty
        if (message.author != '559581042843@c.us' || message.from != '120363369843995074@g.us') {
            return
        }

        // const media = MessageMedia.fromFilePath(`./pictures/bloisinhos/blois${random_blois}.png`);
        // await client.sendMessage(message.from, media, { sendMediaAsSticker: true });

        // const chat = await message.getChat();
        // let mentions = [];
        // let pessoas = ''
        // for (let participantes of chat.participants) {
        //     mentions.push(`${participantes.id.user}@c.us`);
        //     pessoas += `|@${participantes.id.user} `;
        //     console.log(participantes);
        //     break
        // }
        // await chat.sendMessage(pessoas, {mentions});
        async function send_file_content_to_group_mentioning_numbers_of_content(file_path, group_id){
            let membros_msg = await readFile(file_path, 'utf-8');
            let numberPattern = /\d{8,}/g;  // matches 8 or more consecutive digits
            let numbers = membros_msg.match(numberPattern) || [];
            console.log(numbers)
            let mentions = [];
            for (let number of numbers) {
                mentions.push(`${removeFirst9After55(number)}@c.us`);
            }
            console.log(mentions)
            await client.sendMessage(group_id, membros_msg, { mentions: mentions });
        }

        let file_path; let group_id

        file_path = process.env.DRAGON_MEMBERS_IN_SHEET_CLOUD_FILE
        group_id = process.env.GROUP_TO_SEND_CONTACTS_TO_RECRUIT_TO_THATY
        await send_file_content_to_group_mentioning_numbers_of_content(file_path, group_id)

        file_path = process.env.DRAGON_MEMBERS_TO_PUT_IN_SHEET_CLOUD_FILE
        group_id = process.env.GROUP_TO_SEND_CONTACTS_TO_RECRUIT_TO_THATY
        await send_file_content_to_group_mentioning_numbers_of_content(file_path, group_id)
    } else {
        // eventos zarcovi
        // veja o README.md
        let group_dragon_gakure
        if (process.env.DEBUG) {
            group_dragon_gakure = process.env.TEST_GROUP
        } else if (!process.env.DEBUG) {
            group_dragon_gakure = process.env.DRAGON_GAKURE
        }
        if (message.author != process.env.BOT_NUMBER || message.to != group_dragon_gakure) {
            return
        }

        let events_menu = '1 - 📝 Evento: História Contínua 📝'

        if (message.body.toLowerCase() === process.env.PREFIX + 'Menu'.toLowerCase()) {
            await client.sendMessage(group_dragon_gakure, events_menu);
        } else if (message.body.toLowerCase() == '1') {
            
        }

        // 📝 Evento: História Contínua 📝
        // prompts openai
        // me de uma frase que inicia uma historia. somente retorne a frase que inicia a historia
        // a frase "oi, tudo bem" continua o início de história "Em uma cidade cercada por mistérios e segredos, onde o brilho do luar revelava mais do que apenas sombras, um jovem destemido decidiu embarcar em uma jornada que mudaria sua vida para sempre."? Responda com apenas "Sim" ou "Não".
    }
}

let lista_comandos = new Set(['Dg', 'Menu', 'tag'].map(cmd => process.env.PREFIX + cmd))
let messagem_from_list = new Set([process.env.TEST_GROUP, process.env.ARENASC, process.env.BOT_NUMBER, process.env.DRAGON_GAKURE])

// Bot, em loop, lendo as mensagens
client.on('message_create', async message => {

    if (message.from === process.env.TEST_GROUP && process.env.DEBUG) {
        console.log('TEST_GROUP')
        console.log(process.env.TEST_GROUP)
        console.log(`message.body:`, message.body.substring(0, 50))
        console.log(`message.from:`, message.from)
        console.log(`message.to:`, message.to)
        console.log(`message.fromMe:`, message.fromMe)
        console.log(`message.author:`, message.author)
        console.log(`message.timestamp:`, message.timestamp)
        console.log(`message.isGif:`, message.isGif)
        // console.log(`message.isGroupMsg:`, message.isGroupMsg)
        // console.log(`message.isMedia:`, message.isMedia)
        // console.log(`message.isNotification:`, message.isNotification)
        console.log(`.bool: ${message.from === process.env.TEST_GROUP}`);
        console.log(new Date().toLocaleTimeString());
        // process.stdout.write(' ', typeof String.raw`${message.body}`)
    }

    process.stdout.write('.');

    if ([...lista_comandos].some(cmd => cmd.toLowerCase() === String.raw`${message.body}`.toLowerCase())) {
        setTimeout(() => {}, 4000)        
        await Comandos(message);
    } else if ([...messagem_from_list].some(from => from === String.raw`${message.from}`.toLowerCase())) {
        if (message.body.length > 16) {
            setTimeout(() => {}, 4000)        
            await Comandos(message);
        }
    }
});

// Ligar o bot
client.initialize();

module.exports = { Comandos }