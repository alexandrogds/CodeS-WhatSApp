

/*--- Sincronização do bot com o WhatsApp ---*/

const qrcode = require('qrcode-terminal')
const readline = require('readline')
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const { error } = require('./error.js')
const { getTelefoneS } = require('./arena_sc/getTelefoneS.js')
const { appendFile, readFile, writeFile } = require('./myfs.js') // const the functions
const { tratar_messages_da_arena_sc } = require('./arena_sc/tratar_messages_da_arena_sc.js')
const { get_of_open_ai } = require('./get_of_open_ai.js')
const { tag_mentions } = require('./tag_mentions')
const { strip } = require('./lib.js')
const { send_file_membros_com_menções } = require('./zarcovi/send_file_membros_com_menções.js')

require('dotenv').config({ path: './.env' });

// Initialize ALL global variables with appropriate default values.
// It's crucial to initialize these outside the Comandos function
// so that their values are not reset every time Comandos is called.
let phoneS; global.context = {}
global.mensagem_anterior = null
let group_id_ifs_arena_sc_comandos
let group_id_dragon_gakure

// Create a new client instance
global.client = new Client({ authStrategy: new LocalAuth() });

// When the client is ready, run this code (only once)
global.client.once('ready', () => {
    console.log('Client is ready!');
    console.log(new Date().toLocaleTimeString());
    if(process.env.DEBUG == 'true') {
        console.warn('DEBUG On. É isso mesmo?')
    }
});

// When the client received QR-Code
global.client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

// Function to initialize data (nicks, telefones, etc.)
async function initializeData() {
    phoneS = await getTelefoneS()
    global.context['historias_atuais_no_evento_em_dragon_gakure'] = null
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

class Node {
    constructor(id, body) {
      this.id = id;
      this.body = body
      this.children = [];
    }
  
    addChild(child) {
      this.children.push(child);
    }

    serialize() {
        const children = this.children.map(child => child.serialize());
        return {
          id: this.id,
          body: this.body,
          children: children
        };
      }
  
    getAllPaths(path = []) {
      path.push(this.id);
      let paths = [];
      if (this.children.length === 0) {
        paths.push([...path]);
      } else {
        for (const child of this.children) {
          paths.push(...child.getAllPaths([...path]));
        }
      }
      path.pop();
      return paths;
    }
  
    search(id) {
      if (this.id === id) {
        return this;
      }
      for (const child of this.children) {
        const result = child.search(id);
        if (result) {
          return result;
        }
      }
      return null;
    }

    getPathToId(id, path = []) {
        path.push(this.id);
        if (this.id === id) {
          return path;
        }
        for (const child of this.children) {
          const result = child.getPathToId(id, [...path]);
          if (result) {
            return result;
          }
        }
        path.pop();
        return null;
    }


    getPathToNode(id, path = []) {
        path.push(this.body); // Adiciona o 'body' ao caminho
        if (this.id === id) {
            return path.join(' '); // Retorna o caminho como string
        }
        for (const child of this.children) {
            const foundPath = child.getPathToNode(id, [...path]); // Passa uma cópia do caminho
            if (foundPath) {
                return foundPath;
            }
        }
        path.pop(); // Remove o último elemento (backtracking)
        return null;
    }
}

// Função principal que rege todos os comandos
async function Comandos(message) {
    /*--- Comandos Ajuda ---*/
    console.log('into comandos')

    if (message.from == group_id_ifs_arena_sc_comandos && message.body != '.tag') {
        // ARENA SC CONTAGEM DE LUTAS EM TEMPO REAL
        console.log('into comandos if arena sc)')
        await tratar_messages_da_arena_sc(message, group_id_ifs_arena_sc_comandos, phoneS)
    } else if (message.body.toLowerCase() === process.env.PREFIX + 'Dg'.toLowerCase()) {
        // enviar lista de membros do dragon no grupo que passo os contatos para thaty
        // entra aqui no debug e não no primeiro if pois a mensagem é enviada no grupo com thaty
        await send_file_membros_com_menções(message)
    }

    console.log('into second block of ifs')

    // salvar o inicio de historia gerado com a openai em uma variavel global
    // gerar os inicios de historia com comandos
    // lembrando que a partir da segunda geração a resposta deve apresentar a contagem de pontos.
    if (message.body.toLowerCase().startsWith(process.env.PREFIX + 'tag'.toLowerCase()) ) {
        // to tag _ marcar todos do grupo.
        if (message.author != process.env.OWNER_NUMBER) {
            return
        }
        let i = message.body.indexOf(" ")
        let str = message.body.substring(i + 1)
        await tag_mentions(false, false, str, message)
    } else if (message.body.toLowerCase().startsWith(process.env.PREFIX + 'hide-tag'.toLowerCase()) ) {
        // to tag _ marcar todos do grupo.
        if (message.author != process.env.OWNER_NUMBER || message.from != group_id_ifs_arena_sc_comandos) {
            return
        }
        let i = message.body.indexOf(" ")
        let str = message.body.substring(i + 1)
        await tag_mentions(false, true, str, message)
    } else if (message.body.toLowerCase() === 'Evento'.toLowerCase()) {
        // menu de eventos eventos zarcovi
        // veja o README.md
        console.log('entrou into msg Evento')

        if (!message.fromMe || message.to != group_id_dragon_gakure) {
            console.log('entrou no return')
            return
        }

        let dragon_gakure_events_menu = ''
        dragon_gakure_events_menu += '1 - 📝 Evento: História Contínua 📝\n'

        await global.client.sendMessage(group_id_dragon_gakure, dragon_gakure_events_menu);
    } else if (message.body === '1' && message.from === process.env.BOT_NUMBER && message.to === group_id_dragon_gakure) {
        console.log('into start event historia continua')
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
    } else if (message.body === '.' && message.fromMe && message.to === group_id_dragon_gakure) {
        console.log('1236544152')
        async function send_inicio_de_historia() {
            let inicio_de_historia
            if (process.env.DEBUG == 'true') {
                inicio_de_historia = 'A tempestade chegou sem aviso, trazendo consigo segredos há muito enterrados.'
            } else {
                inicio_de_historia = await get_of_open_ai('me de uma frase que inicia uma historia. somente retorne a frase que inicia a historia')
            }
            if (!global.reply) {
                global.historia_atual = await global.reply.reply(inicio_de_historia)
            } else if (global.reply) {
                global.reply = await global.reply.reply(inicio_de_historia)
                global.historia_atual = global.reply
            }
            global.context['inicio_de_historia_atual_no_evento_em_dragon_gakure'] = inicio_de_historia
            if ( global.context['historias_atuais_no_evento_em_dragon_gakure'] == null ) {
                global.context['historias_atuais_no_evento_em_dragon_gakure'] = new Node(global.historia_atual.id.id, global.historia_atual.body)
            }
        }
        if (global.context['is_event_running_in_dragon_gakure'] && global.context['inicio_de_evento']) {
            await send_inicio_de_historia()
            global.context['inicio_de_evento'] = false
        } else if (global.context['is_event_running_in_dragon_gakure']) {
            await send_table_event_historia_continua()
            setTimeout(() => {}, 3000)
            await send_inicio_de_historia()
        }
        global.context['is_event_running_in_dragon_gakure'] = true
    } else if (message.body === 'end' && message.from === process.env.BOT_NUMBER && message.to === group_id_dragon_gakure) {
        console.log('1236541451')
        await send_table_event_historia_continua()
        global.context['is_event_running_in_dragon_gakure'] = false
        global.context['inicio_de_historia_atual_no_evento_em_dragon_gakure'] = null
        global.reply = null
        global.context['historias_atuais_no_evento_em_dragon_gakure'] = null
    } else {
        console.log(message)
        console.log('into else of second block of ifs', '; message.from: ', message.from)
        console.log(global.context['is_event_running_in_dragon_gakure'])
        console.log(global.context.is_event_running_in_dragon_gakure)
        if (global.context['is_event_running_in_dragon_gakure'] && message.from == group_id_dragon_gakure) {
            // para testar as frases utilize o numero que não é de scripts
            // IMPLEMENTAR PARA QUANDO O REPLY É FEITO EM UMA MENSAGEM QUE NÃO É A ÚLTIMA
            // IMPLEMENTAR EM ARVORE
            console.log('into event historia continua')
            console.log(message.body)
            let msg_quoted = await message.getQuotedMessage()
            let send; 
            let aux3 = global.context['historias_atuais_no_evento_em_dragon_gakure']
            if ( message.hasQuotedMsg ) {
                send = aux3.getPathToNode(msg_quoted.id.id)
                if ( !send ) {
                    if ( msg_quoted.id.id ) {// ja é diferente do inicio da historia pois se fosse igual teria `send`
                        error(JSON.stringify({'aux3': aux3.serialize(), 'message.id': message.id.id, 'msg_quoted.id': msg_quoted.id.id}, null, 0), 1534896, 'algo nao foi encontrado na arvore do evento historia continua')
                        return//pois se tivesse sido validado com sim, `send` estaria na arvore.
                    }
                    error(JSON.stringify({'aux3': aux3.serialize(), 'message.id': message.id.id, 'msg_quoted.id': msg_quoted.id.id}, null, 0), 1534896, 'algo nao foi encontrado na arvore do evento historia continua')
                    return
                }
            } else {
                send = global.historia_atual.body
            }
            let aux = `a frase "${message.body}" continua o início de história "${send}"? Responda com apenas "Sim" ou "Não".`
            let sim_ou_nao
            if (process.env.DEBUG) {
                sim_ou_nao = 'sim.'
            } else {
                setTimeout(() => {}, 3000)
                sim_ou_nao = await get_of_open_ai(aux)
            }
            console.log('sim_ou_nao =', sim_ou_nao)
            if (sim_ou_nao.toLowerCase() == 'sim.' || sim_ou_nao.toLowerCase() == 'sim') {
                console.log('into sim')
                if ( message.hasQuotedMsg ) {
                    global.context['historias_atuais_no_evento_em_dragon_gakure'].search(msg_quoted.id.id).addChild(new Node(message.id.id, message.body))
                }
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
                console.log(global.context['historias_atuais_no_evento_em_dragon_gakure'])
            }
        } else {
        }
        // if (process.env.DEBUG == 'true' ) {
        //     const chats = await global.client.getChats()
        //     for(let chat of chats) {
        //         if (chat.isGroup == false && message.from == chat.id.id) {
        //             function ddd() {
        //                 return new Promise((resolve) => {
        //                     console.log('\n', message.getChat().name)
        //                     console.log(message.body)
        //                     let b = '\nEscreva a resposta:\n> ';
        //                     console.log(b)
        //                             let aa = readline.createInterface({
        //                         input: process.stdin,
        //                         output: process.stdout
        //                     });
        //                     aa.on('line', async (input) => {
        //                         await message.reply(input)
        //                         aa.close();
        //                     });
        //                     resolve(0)
        //                 });
        //             }
        //             await ddd()
        //             break
        //         }
        //     }
        //     if (!global.chat) {
        //         let b = 'ESCOLHA UM GRUPO ABAIXO PARA LER AS MENSAGENS ATUAIS:\n> ';
        //         // NÃO APARECE TODOS POIS É O NÚMERO DOS SCRIPTS
        //         let i = -1
        //         for(let chat of chats) {
        //             i += 1
        //             if (chat.isGroup) {
        //                 b += `${i} - ${chat.name}\n`
        //             } else {
        //             //     console.log(chat.name)
        //             }
        //         }

        //         function bbb() {
        //             return new Promise((resolve) => {
        //                 console.log(b)
        //                 let aa = readline.createInterface({
        //                     input: process.stdin,
        //                     output: process.stdout
        //                 });
        //                 aa.on('line', async (input) => {
        //                     global.chat = chats[input[0]]
        //                     aa.close();
        //                 });
        //                 resolve(0)
        //             });
        //         }
        //         await bbb()
        //     } else if (global.chat.id.id == message.from && global.chat) {
        //         for(let chat of chats) {
        //             if (chat.id.id == global.chat.id.id) {
        //                 function ccc() {
        //                     return new Promise((resolve) => {
        //                         console.log('\n', message.getChat().name)
        //                         console.log(message.body)
        //                         let b = '\nEscreva a resposta:\n> ';
        //                         console.log(b)
        //                         let aa = readline.createInterface({
        //                             input: process.stdin,
        //                             output: process.stdout
        //                         });
        //                         aa.on('line', async (input) => {
        //                             await message.reply(input)
        //                             aa.close();
        //                         });
        //                         resolve(0)
        //                     });
        //                 }
        //                 await ccc()
        //                 break
        //             }
        //         }
        //     }
        //     function aaa() {
        //         return new Promise((resolve) => {
        //             let b = 'Continuar para próxima mensagem nesse grupo? s para sim, n para escolher novo* grupo. Ignore caso tenha sido uma resposta a mensagem privada.:\n> ';
        //             console.log(b)
        //             let aa = readline.createInterface({
        //                 input: process.stdin,
        //                 output: process.stdout
        //             });
        //             aa.on('line', async (input) => {
        //                 if (input[0] == 'n') {
        //                     global.chat = null
        //                 }
        //                 aa.close();
        //             });
        //             resolve(0)
        //         });
        //     }
        //     await aaa()
        // }
    }
}

let lista_comandos = new Set(['Dg', 'Eventos', 'tag'].map(cmd => process.env.PREFIX + cmd))
// let messagem_from_list = new Set([process.env.TEST_GROUP, process.env.ARENASC, 
//     process.env.DRAGON_GAKURE, process.env.OWNER_NUMBER])
let messagem_from_list = new Set([process.env.TEST_GROUP, process.env.ARENASC, 
    process.env.OWNER_NUMBER])

// Bot, em loop, lendo as mensagens
global.client.on('message_create', async message => {

    if (message.from == process.env.TEST_GROUP && process.env.DEBUG == 'true') {
        console.log('\nTEST_GROUP')
        console.log(process.env.TEST_GROUP)
        console.log(`message.body:`, message.body.substring(0, 50))
        console.log(`message.from:`, message.from)
        console.log(`message.to:`, message.to)
        console.log(`message.fromMe:`, message.fromMe)
        console.log(`message.author:`, message.author)
        console.log(`message.timestamp:`, message.timestamp)
        console.log(`message.isGif:`, message.isGif)
        console.log(`process.env.OWNER_NUMBER`, process.env.OWNER_NUMBER)
        // console.log(`message.isGroupMsg:`, message.isGroupMsg)
        // console.log(`message.isMedia:`, message.isMedia)
        // console.log(`message.isNotification:`, message.isNotification)
        console.log(new Date().toLocaleTimeString(), '\n');
        // process.stdout.write(' ', typeof String.raw`${message.body}`)
    }
    if (process.env.DEBUG == 'true') {
        group_id_ifs_arena_sc_comandos = process.env.TEST_GROUP
        group_id_dragon_gakure = process.env.TEST_GROUP
    } else {
        group_id_ifs_arena_sc_comandos = process.env.ARENASC
        group_id_dragon_gakure = process.env.DRAGON_GAKURE
    }

    process.stdout.write('now: ' + new Date().toLocaleTimeString() + '; msg_time: ' + new Date(message.timestamp).toLocaleTimeString() + ' _ ');

    if ([...lista_comandos].some(cmd => String.raw`${message.body}`.toLowerCase().startsWith(cmd.toLowerCase()))) {
        setTimeout(() => {}, 4000)
        await Comandos(message);
    } else if ([...messagem_from_list].some(from => from === String.raw`${message.from}`.toLowerCase())) {
        // if (message.body.length > 16) {
            // setTimeout(() => {}, 4000)
            await Comandos(message);
        // }
    } else if (message.fromMe) {
        await Comandos(message);
    } else if (global.context['is_event_running_in_dragon_gakure'] && message.from === group_id_dragon_gakure) {
        await Comandos(message);
    } else {
        // await Comandos(message);
    }
});

// Ligar o bot
global.client.initialize();

module.exports = { Comandos }
