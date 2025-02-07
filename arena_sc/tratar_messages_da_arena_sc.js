

const error = require('../error.js')
const { readFile, writeFile } = require('../myfs.js') // const the functions
const { getNickSOfMessage } = require('./getNickSOfMessage.js')
const { calcularProximidade } = require('./calcularProximidade.js')
const { definir_winner } = require('./definir_winner.js')
const { contarUnicodeEmojis } = require('./contarUnicodeEmojis.js')
const { getWinnersAndTheirFights } = require('./getWinnersAndTheirFights.js')
const { generateTable } = require('./generateTable.js')

async function tratar_messages_da_arena_sc(message, group_id_if_arena_sc_comandos, phoneS) {
    // ARENA SC CONTAGEM DE LUTAS EM TEMPO REAL
    let winner = null
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
        winner = definir_winner(message, nickSOfMessage, numbers, dataHoraUser, global.mensagem_anterior, resultados)
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
        global.mensagem_anterior = message
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
    await global.client.sendMessage(group_id_if_arena_sc_comandos, table)
    console.log('Mensagem enviada.')
}

module.exports = { tratar_messages_da_arena_sc }
