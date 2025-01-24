/*--- Sincronização do bot com o WhatsApp ---*/

const qrcode = require('qrcode-terminal')
const dotenv = require('dotenv')
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const analyzeResults = require('./analyzeResults.js')
const calcularProximidade = require('./calcularProximidade.js')
const getNicksOfMessage = require('./getNicksOfMessage.js')
const { registrar_pontos } = require('./registrarPontos.js') // Named const
const registrarPontosHelper = require('./registrarPontosHelper.js')
const error = require('./error.js')
const getTelefoneS = require('./getTelefoneS.js')
const contarUnicodeEmojis = require('./contarUnicodeEmojis.js')
const { handleOneFlag, handleTwoFlags } = require('./fss.js') // const the functions
const { processDataAndSave } = require('./processDataAndSave.js') // const the functions
const { appendFile, readFile, writeFile } = require('./myfs.js') // const the functions
const generateTable = require('./generateTable.js')
const determineWinner = require('./determineWinner.js')
const getWinnersAndTheirFights = require('./getWinnersAndTheirFights.js')

dotenv.config({ path: './.env' });

// Initialize ALL global variables with appropriate default values.
// It's crucial to initialize these outside the Comandos function
// so that their values are not reset every time Comandos is called.
let phoneS
let juizes_e_os_players_da_luta = {};
let nicks_e_seus_telefones = [];
let data_hora_da_ultima_tabela = null;
let aux_dia_semana_numero = null;
let nicks_e_suas_quantidade_de_vitorias = {};
let datas_nicks_e_suas_quantidade_de_vitorias = {};
let meses_e_nicks_com_suas_quantidade_de_vitorias = {};
let periodo_mensal = null;
let periodo_semanal = null;
let dia_semana_numero = null;
let quem_enviou_a_mensagem_anterior__juiz = null;
let data_hora_objeto = null;
let dia = null;
let mes = null;
let ano = null;
// let nicks = []; // Initialize nicks array
let nickSOfMessage = []; // Initialize nickSOfMessage array
let flag = '';

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

async function readDragonMembers() {
    try {
        const content = await readFile(`C:/Users/user/OneDrive/RPG's/Zarcovi/membros dragon gakure.md`, 'utf-8');
        return content;
    } catch (error) {
        console.error('Error reading Dragon Gakure members file:', error);
        return null;
    }
}

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

// Function to initialize data (nicks, telefones, etc.)
async function initializeData() {
    phoneS = await getTelefoneS();
}

initializeData()

// Função principal que rege todos os comandos
async function Comandos(message) {
    /*--- Comandos Ajuda ---*/
    let group
    let qwe
    if (process.env.DEBUG) {
        group = process.env.TEST_GROUP
        qwe = 'TEST_GROUP'
    } else if (!process.env.DEBUG) {
        group = process.env.ARENASC
        qwe = 'ARENASC'
    }
    if (message.from === group && message.body != '.tag') {
        console.log(qwe)
        console.log(group)
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
        process.stdout.write(`\n.bool: ${message.from === process.env.TEST_GROUP}`);
        process.stdout.write(new Date().toLocaleTimeString());
        // process.stdout.write(' ', typeof String.raw`${message.body}`)
        
        let winner
        let dataHoraUser = {  // Create the object
			data_hora: message.timestamp,
			usuario: message.author || message.from // Use author if available, otherwise from
		};
        process.stdout.write('entrou1.');
        
        //Regular expression matching numbers with 1 to 3 digits not surrounded by other digits
        const regex = /(?<!\d)[0-9]{1,3}(?!\d)/g;
        const numbers = message.body.match(regex) || [];
        process.stdout.write(`Extracted Numbers: ${numbers}.`);
    
        const nickSOfMessage = await getNicksOfMessage(message);
		const nick_count = nickSOfMessage.length; // Get nick_count here

        if (numbers.length < 4) {
            return
        } else if ( nick_count == 2) {
            const resultados = calcularProximidade(message.body, nickSOfMessage)
            console.log(resultados)
            // let allStatuS = resultados[nickSOfMessage[0]]['status'].concat(resultados[nickSOfMessage[1]]['status'])
            // let resultsProcess = allStatuS.reduce((map) => { if (map.has(0)) { map.set(0, map.get(0) + 1); } else { map.set(0, 1); } return map; }, new Map())
            if (resultados.length == 0) {
            // if (resultados.length != 2) {
                error(message.body, '23', 'PARECE HAVER MAIS QUE 2 OU MENOS QUE 2 DE LINHAS QUE REPRESENTAM O STATUS DE LIFE E CHAKRA');
                return null; // Or handle the error differently
            } 
            // fazer na mao todas as possibilidades de 0 à 3 daria 0,0 0,1 0,2 0,3 1,1 1,2 1,3 2,2 2,3 3,3
            // else if ( resultados[nickSOfMessage[0]]['status'].length == 2 ) {
            //     if (resultados[nickSOfMessage[1]]['status'].length == 2) {
            //         if (resultados[nickSOfMessage[0]]['status'][0] == 2) {

            //         }
            //     }
            // }











            else if ((resultados[0][1].length !== 2 || resultados[1][1].length !== 2) && flag != '') {
                if (resultados[0][1].length === 3) {
                    if (resultados[0][1].filter(x => x === Math.min(...resultados[0][1])).length === 1) { // Count occurrences of min value
                        const minIndex = resultados[0][1].indexOf(Math.min(...resultados[0][1]));
                        if (minIndex === 2) {
                            flag += '0 && mana;';
                        } else if (minIndex === 1) {
                            flag += '0 && vida;';
                        } else {
                            error(message.body, '555111', `efeito sobre vida deslocado`); // Use JSON.stringify
                            return null; // Or handle error as needed
                        }
                    }
                } else if (resultados[0][1].length === 4) {
                    if (resultados[0][1][1] != 0 && resultados[0][1][3] != 0) {
                        flag += '0 && mana; 0 && vida;';
                    } else {
                        error(message.body, '000011', `ESSA LUTA TEM SIMULTANEAMENTE DOIS EFEITOS SECUNDARIOS JUNTOS AO LIFE E CHAKRA`); // Use JSON.stringify
                    }
                } else {
                    error(message.body, '666111', `ESSA LUTA TEM SIMULTANEAMENTE DOIS EFEITOS SECUNDARIOS JUNTOS AO LIFE E CHAKRA`); // Use JSON.stringify
                    return
                }
        
                if (resultados[1][1].length === 3) {
                    if (resultados[1][1].filter(x => x === Math.min(...resultados[1][1])).length === 1) {
                        const minIndex = resultados[1][1].indexOf(Math.min(...resultados[1][1]));
                        if (minIndex === 2) {
                            flag += '1 && mana;';
                        } else if (minIndex === 1) {
                            flag += '1 && vida;';
                        } else {
                            error(message.body, '888811', `efeito sobre vida deslocado`); // Use JSON.stringify
                            return null;// Or handle error as needed
                        }
                    }
                }else if(resultados[1][1].length === 4){
                    // TODO
                } else {
                    error(message.body, '777111', `ESSA LUTA TEM SIMULTANEAMENTE DOIS EFEITOS SECUNDARIOS JUNTOS AO LIFE E CHAKRA`); // Use JSON.stringify
                    return
                }
            } else if (resultados[0][1] && resultados[1][1] && resultados[0][1].join("") === resultados[1][1].join("") && (resultados[0][1].includes(0) || resultados[1][1].includes(0))) {
                error(message.body, '22', 'TRATAR PARA PEGAR A TABELA ANTERIOR PARA DECIDIR QUEM VENCE.\nRESULTADOS = ' + JSON.stringify(resultados));
            } else if (flag && resultados[0][1] && resultados[1][1] && resultados[0][1][0] === 0 && resultados[1][1][0] === 0) {
                console.log('ENTROU<-123')
                const a99 = flag.split(';').filter(x => x !== '');
                if (a99.length === 1) {
                    winner = handleOneFlag(a99, resultados, telefones, juizes_e_os_players_da_luta, quem_enviou_a_mensagem_anterior__juiz, nicks_e_seus_telefones, data_hora_da_ultima_tabela, dia, mes, ano, nicks, data_hora_objeto, dia_semana_numero, aux_dia_semana_numero, nicks_e_suas_quantidade_de_vitorias, datas_nicks_e_suas_quantidade_de_vitorias, meses_e_nicks_com_suas_quantidade_de_vitorias, periodo_mensal, periodo_semanal, nickSOfMessage, registrarPontosHelper); // Pass necessary variables
                } else if (a99.length === 2) {
                    winner = handleTwoFlags(a99, resultados, telefones, juizes_e_os_players_da_luta, quem_enviou_a_mensagem_anterior__juiz, nicks_e_seus_telefones, data_hora_da_ultima_tabela, dia, mes, ano, nicks, data_hora_objeto, dia_semana_numero, aux_dia_semana_numero, nicks_e_suas_quantidade_de_vitorias, datas_nicks_e_suas_quantidade_de_vitorias, meses_e_nicks_com_suas_quantidade_de_vitorias, periodo_mensal, periodo_semanal, nickSOfMessage, registrarPontosHelper); // Pass necessary variables
                }
                flag = null; // Reset flag
            }  else if (resultados[0][1] && resultados[1][1]) {
                if (flag && resultados[0][1][0] === 0) {
                    winner = resultados[1][0]
                } else if (flag && resultados[1][1][0] === 0) {
                    winner = resultados[0][0]
                } else if (resultados[0][1][0] === 0 && resultados[1][1][0] === 0) {  // Both vida are 0
                    if (resultados[0][1][1] < resultados[1][1][1]) {
                        winner = resultados[1][0]
                    } else if (resultados[0][1][1] > resultados[1][1][1]) {
                        winner = resultados[0][0]
                    } else {
                        // Handle tie or error (when both mana are also equal)
                        error(msg, numbers, dataHoraUser, '33', `IMPLEMENTAR PARA SE O CHAKRA FOR IGUAL PARA CONSULTAR NA TABELA ANTERIOR.\nRESULTADOS = ${resultados}`)
                    }
                } else if (resultados[0][1][0] === 0) {
                    winner = resultados[1][0]
                } else if (resultados[1][1][0] === 0) {
                    winner = resultados[0][0]
                }
            }
        } else if (nick_count === 1) {
            error(message.body, '0', `Pegar o nick da placa abaixo diferente do nick: ${aux_nick}`)
            console.error("\n\nID=0");
            console.error(`\nPegar o nick da placa abaixo diferente do nick: ${aux_nick}\n${message.body}\n`);//verificar se aux_nick existe
            // Handle the error as needed (e.g., send a message, return) – don't just exit()

            return;
        
        } else if (nick_count === 0 && message.body && contarUnicodeEmojis(message.body) < 50) {
            return
            console.error("\n\nID=2");
            console.error("numbers =", numbers);
            console.error("data-user =", data_hora_e_user_da_mensagem_anterior);
            console.error(`\nPegar os dois nicks da placa abaixo: \n\n${message.body}\n`);
            // Handle the error (e.g., send a message, return) – don't just exit()
        
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
            return
        }

        let winners = await readFile(process.env.WINNERS_ARENA_SC)
        winners = JSON.parse(winners)
        console.log('winners = ', winners)
        const dataToAppend = {
            'winner': winner.toLowerCase(),
            'phone': phoneS[winner.toLowerCase()],
            'timestamp': message.timestamp,
            'author': message.author || message.from
        };
        console.log('dataToAppend = ', dataToAppend)
        winners.push(dataToAppend)
        console.log('winners = ', winners)
        await writeFile(process.env.WINNERS_ARENA_SC, JSON.stringify(winners, null, 2)); // Correctly call using await

        let winnersAndTheirFights = await getWinnersAndTheirFights(winners)
        console.log(winnersAndTheirFights)
        let table = await generateTable(winnersAndTheirFights)

        console.log('Enviando mensagem.')
        console.log(typeof table)
        await client.sendMessage(group, table)
        console.log('Mensagem enviada.')
    } else if (message.author == '559581042843@c.us' && message.body.toLowerCase() === process.env.PREFIX + 'tag'.toLowerCase()) {
        const chat = await message.getChat();
        let mentions = [];
        let pessoas = ''
        for (let participantes of chat.participants) {
            mentions.push(`${participantes.id.user}@c.us`);
            pessoas += `|@${participantes.id.user} `;
            console.log(participantes);
            break
        }
        // await chat.sendMessage(pessoas, {mentions});
        await chat.sendMessage('Leiam a mensagem acima.', {mentions});
    } else if (message.body.toLowerCase() === process.env.PREFIX + 'Menu'.toLowerCase()) {
        if (!message.author) {
            return
        }

        let msg = `Comandos disponíveis:\n\n`;
        msg += `Dg = Enviar lista de membros do Dragon Gakure\n`;

        await client.sendMessage(message.from, msg);
    } else if (message.body.toLowerCase() === process.env.PREFIX + 'Dg'.toLowerCase()) {
        if (message.author) {
            return
        }

        // await menuCLI()

        // console.log(message);

        // let admin = await message.getContact();
        // if (lista_admins.includes(admin.id.user)) {
        // let usuario = await message.getContact();
        // if(message.author === usuario.id._serialized){

        // let lista = bicho.map(user => `${user}@c.us`);
        // let pessoas = `@${bicho.join(', @')}`;
        // await client.sendMessage(message.from, pessoas, {mentions: lista});

        // const media = MessageMedia.fromFilePath(`./pictures/bloisinhos/blois${random_blois}.png`);
        // await client.sendMessage(message.from, media, { sendMediaAsSticker: true });

        let membros_msg = await readDragonMembers();
        let numberPattern = /\d{8,}/g;  // matches 8 or more consecutive digits
        let numbers = membros_msg.match(numberPattern) || [];
        let mentions = [];
        for (let number of numbers) {
            mentions.push(`${number}@c.us`);
        }

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

        // await client.sendMessage(message.to, membros_msg, { mentions: mentions });

        // let msg = '@5595981042843';
        // let mentions = ['5595981042843@c.us'];
        // await client.sendMessage(message.to, msg, { mentions: mentions });

        await client.sendMessage(group_dragon, membros_msg, { mentions: mentions });
        // await client.sendMessage(group_swap, membros_msg, { mentions: mentions });
        // if (message.fromMe) {
        //     await client.sendMessage(message.to, membros_msg, { mentions: mentions });
        // } else {
        //     await client.sendMessage(message.from, membros_msg, { mentions: mentions });
        // }
    }
}

let lista_comandos = ['Dg', 'Menu', 'tag'].map(cmd => process.env.PREFIX + cmd)

// Spam handling
let lista_spam = [];
let flag_spam = 0;

// Bot, em loop, lendo as mensagens
client.on('message_create', async message => {

    if ( message.from === process.env.TEST_GROUP) {
        console.log('TEST_GROUP')
        console.log(process.env.TEST_GROUP)
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
        process.stdout.write(`.bool: ${message.from === process.env.TEST_GROUP}`);
        process.stdout.write(new Date().toLocaleTimeString());
        // process.stdout.write(' ', typeof String.raw`${message.body}`)
    }
    
    process.stdout.write('.');

    if ([...lista_comandos].some(cmd => cmd.toLowerCase() === String.raw`${message.body}`.toLowerCase())) {
        let msg1 = message.timestamp;
        lista_spam[flag_spam] = msg1;

        flag_spam++;

        if(flag_spam == 2){
            flag_spam = 0;
        }

        if(!(Math.abs(lista_spam[1] - lista_spam[0]) < 3)){
            await Comandos(message);
        }
    } else if ( message.from === process.env.TEST_GROUP || message.from === process.env.ARENASC) {
        await Comandos(message);
    }
});

// Ligar o bot
client.initialize();
