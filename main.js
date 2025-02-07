

/*--- Sincronização do bot com o WhatsApp ---*/

const qrcode = require('qrcode-terminal')
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const { getTelefoneS } = require('./arena_sc/getTelefoneS.js')
const { appendFile, readFile, writeFile } = require('./myfs.js') // const the functions
const { tratar_messages_da_arena_sc } = require('./arena_sc/tratar_messages_da_arena_sc.js')
const { get_of_open_ai } = require('./get_of_open_ai.js')
const { tag_mentions } = require('./tag_mentions')
const { strip } = require('./lib.js')
const { send_file_membros_com_menções } = require('./zarcovi/send_file_membros_com_menções.js')
const { save_chats } = require('./save_chats.js')

require('dotenv').config({ path: './.env' });

// Initialize ALL global variables with appropriate default values.
// It's crucial to initialize these outside the Comandos function
// so that their values are not reset every time Comandos is called.
let phoneS
global.context = {}
global.mensagem_anterior = null

// Create a new client instance
global.client = new Client({ authStrategy: new LocalAuth() });

// When the client is ready, run this code (only once)
global.client.once('ready', () => {
    console.log('Client is ready!');
    console.log(new Date().toLocaleTimeString());
});

// When the client received QR-Code
global.client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

// Function to initialize data (nicks, telefones, etc.)
async function initializeData() {
    phoneS = await getTelefoneS()
}

initializeData()

async function send_table_event_historia_continua() {
    let ryos = JSON.parse(await readFile(process.env.RYOS_GANHOS + ' ' + global.context['sufixo_do_evento'].replace(/\D/g, '') + '.json'))
    let table = await readFile(process.env.HISTORIA_CONTINUA_EVENTO)
    console.log(table, typeof table)
    table = table.toString()
    const ryosCounts = {};
    ryos.forEach(ryosJson => {
        const conta = ryosJson.conta;
        ryosCounts[conta] = (ryosCounts[conta] || 0) + ryosJson.ryos;
    });
    Object.keys(ryosCounts).forEach(conta => { 
        if (table.includes('.  ')) {
            table = table.replace('.  ', `. ${conta} +${ryosCounts[conta]}B`) 
        } else {
            table += `\n. ${conta} +${ryosCounts[conta]}B`
        }
    });
    global.reply = await global.reply.reply(table)
}

function menuCLI() {
    // menu pela linha de comando
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

// Função principal que rege todos os comandos
async function Comandos(message) {
    /*--- Comandos Ajuda ---*/
    let group_id_ifs_arena_sc_comandos; let group_if_arena_sc_comandos
    let group_id_dragon_gakure
    if (process.env.DEBUG) {
        group_id_ifs_arena_sc_comandos = process.env.TEST_GROUP
        group_if_arena_sc_comandos = 'TEST_GROUP'
        group_id_dragon_gakure = process.env.TEST_GROUP

        console.log(`\nbool message.from == process.env.TEST_GROUP: ${message.from == process.env.TEST_GROUP}`);
        console.log(`bool message.from == group_id_ifs_arena_sc_comandos: ${message.from == group_id_ifs_arena_sc_comandos}`);
        console.log(`boll message.body != '.tag': ${message.body != '.tag'}`)

        console.log('group onde will send =', group_if_arena_sc_comandos)
        console.log('group id =', group_id_ifs_arena_sc_comandos)
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
        console.log(new Date().toLocaleTimeString());
        // process.stdout.write(' ', typeof String.raw`${message.body}`)
    } else {
        group_id_ifs_arena_sc_comandos = process.env.ARENASC
        group_if_arena_sc_comandos = 'ARENASC'
        group_id_dragon_gakure = process.env.DRAGON_GAKURE
    }

    if (message.from == group_id_ifs_arena_sc_comandos && message.body != '.tag') {
        // ARENA SC CONTAGEM DE LUTAS EM TEMPO REAL
        console.log('into comandos if arena sc)')
        await tratar_messages_da_arena_sc(message, group_id_ifs_arena_sc_comandos, phoneS)
    } else if (message.body.toLowerCase() === process.env.PREFIX + 'Dg'.toLowerCase()) {
        // enviar lista de membros do dragon no grupo que passo os contatos para thaty
        // entra aqui no debug e não no primeiro if pois a mensagem é enviada no grupo com thaty
        await send_file_membros_com_menções(message)
    } else if (message.body.toLowerCase() === process.env.PREFIX + 'save'.toLowerCase()) {
        save_chats(message)
    }

    // salvar o inicio de historia gerado com a openai em uma variavel global
    // gerar os inicios de historia com comandos
    // lembrando que a partir da segunda geração a resposta deve apresentar a contagem de pontos.
    if (message.body.toLowerCase() === process.env.PREFIX + 'tag'.toLowerCase()) {
        // to tag _ marcar todos do grupo.
        if (message.author != process.env.OWNER_NUMBER || message.from != group_id_ifs_arena_sc_comandos) {
            return
        }
        await tag_mentions(false, true, 'Leiam a mensagem acima.', message)
    } else if (message.body.toLowerCase() === 'Evento'.toLowerCase()) {
        // menu de eventos eventos zarcovi
        // veja o README.md
        console.log('entrou into msg Evento')

        if (message.from != process.env.BOT_NUMBER || message.to != group_id_dragon_gakure) {
            console.log('entrou no return')
            return
        }

        let dragon_gakure_events_menu = ''
        dragon_gakure_events_menu += '1 - 📝 Evento: História Contínua 📝\n'

        await global.client.sendMessage(group_id_dragon_gakure, dragon_gakure_events_menu);
    } else if (message.body === '1' && message.from === process.env.BOT_NUMBER && message.to === group_id_dragon_gakure) {
        console.log('123654456')
        global.context['is_event_running_in_dragon_gakure'] = true
        const time = new Date().toLocaleTimeString()
        const data = new Date().toLocaleDateString()
        const dt = data + ' ' + time
        global.context['sufixo_do_evento'] = dt
        await writeFile(process.env.RYOS_GANHOS + ' ' + global.context['sufixo_do_evento'].replace(/\D/g, '') + '.json', JSON.stringify([], null, 2 + '.json'))
        let table = strip(await readFile(process.env.HISTORIA_CONTINUA_EVENTO))
        await tag_mentions(false, false,  'EVENTO\n', message)
        setTimeout(() => {}, 3000)
        global.reply = await global.client.sendMessage(group_id_dragon_gakure, table)
        global.context['inicio_de_evento'] = true
    } else if (message.body === '.' && message.from === process.env.BOT_NUMBER && message.to === group_id_dragon_gakure) {
        console.log('1236544152')
        async function send_inicio_de_historia() {
            let inicio_de_historia
            if (process.env.DEBUG) {
                inicio_de_historia = 'A tempestade chegou sem aviso, trazendo consigo segredos há muito enterrados.'
            } else {
                inicio_de_historia = await get_of_open_ai('me de uma frase que inicia uma historia. somente retorne a frase que inicia a historia')
            }
            if (!global.reply) {
                await global.reply.reply(inicio_de_historia)
            } else if (global.reply) {
                global.reply = await global.reply.reply(inicio_de_historia)
            }
            global.context['inicio_de_historia_atual_no_evento_em_dragon_gakure'] = inicio_de_historia
        }
        if (global.context['is_event_running_in_dragon_gakure'] && global.context['inicio_de_evento']) {
            await send_inicio_de_historia()
            global.context['inicio_de_evento'] = false
        } else if (global.context['is_event_running_in_dragon_gakure']) {
            await send_table_event_historia_continua()
            setTimeout(() => {}, 3000)
            await send_inicio_de_historia()
        }
    } else if (message.body === 'end' && message.from === process.env.BOT_NUMBER && message.to === group_id_dragon_gakure) {
        console.log('1236541451')
        await send_table_event_historia_continua()
        global.context['is_event_running_in_dragon_gakure'] = false
        global.context['inicio_de_historia_atual_no_evento_em_dragon_gakure'] = null
        global.reply = null
    } else {
        console.log('123654451')
        if (global.context['is_event_running_in_dragon_gakure'] && message.from == group_id_dragon_gakure) {
            if (message.from === process.env.BOT_NUMBER) {
                return
            }
            let aux = `a frase "${message.body}" continua o início de história "${global.context['inicio_de_historia_atual_no_evento_em_dragon_gakure']}"? Responda com apenas "Sim" ou "Não".`
            let sim_ou_nao
            if (process.env.DEBUG) {
                sim_ou_nao = 'sim.'
            } else {
                setTimeout(() => {}, 3000)
                sim_ou_nao = await get_of_open_ai(aux)
            }
            console.log('sim_ou_nao =', sim_ou_nao)
            if (sim_ou_nao.toLowerCase() == 'sim.' || sim_ou_nao.toLowerCase() == 'sim') {
                let ryos = JSON.parse(await readFile(process.env.RYOS_GANHOS + ' ' + global.context['sufixo_do_evento'].replace(/\D/g, '') + '.json'))
                const dataToAppend = {
                    'conta': 'Dg' + message.author.slice(0, -5).slice(-4),
                    'ryos': 5,
                    'phone': message.author.slice(0, -5),
                    'timestamp': message.timestamp,
                    'author': message.author
                };
                ryos.push(dataToAppend)
                await writeFile(process.env.RYOS_GANHOS + ' ' + global.context['sufixo_do_evento'].replace(/\D/g, '') + '.json', JSON.stringify(ryos, null, 2)); // Correctly call using await
            }
        }
    }
}

let lista_comandos = new Set(['Dg', 'Eventos', 'tag'].map(cmd => process.env.PREFIX + cmd))
let messagem_from_list = new Set([process.env.TEST_GROUP, process.env.ARENASC, process.env.BOT_NUMBER, process.env.DRAGON_GAKURE])

// Bot, em loop, lendo as mensagens
global.client.on('message_create', async message => {

    if (message.from == process.env.TEST_GROUP && process.env.DEBUG) {
        console.log('\nTEST_GROUP')
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
        console.log(new Date().toLocaleTimeString(), '\n');
        // process.stdout.write(' ', typeof String.raw`${message.body}`)
    }

    process.stdout.write('.');

    if ([...lista_comandos].some(cmd => cmd.toLowerCase() === String.raw`${message.body}`.toLowerCase())) {
        setTimeout(() => {}, 4000)
        await Comandos(message);
    } else if ([...messagem_from_list].some(from => from === String.raw`${message.from}`.toLowerCase())) {
        // if (message.body.length > 16) {
            // setTimeout(() => {}, 4000)
            await Comandos(message);
        // }
    }
});

// Ligar o bot
global.client.initialize();

module.exports = { Comandos }
