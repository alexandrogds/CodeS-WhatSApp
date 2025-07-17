

const error = require('../error.js')
const { getNickSOfMessage } = require('./getNickSOfMessage.js')
const { calcularProximidade } = require('./calcularProximidade.js')

async function comparar_mana_da_penultima_placa_parcial_de_luta(mensagem_anterior) {
    const nickSOfMessage = await getNickSOfMessage(mensagem_anterior);
    const resultados = calcularProximidade(mensagem_anterior.body, nickSOfMessage)

    // aqui não entra os que tem buff/debuff
    if (resultados[0][1][1] > resultados[1][1][1]) {
        return resultados[0][0]
    } else if (resultados[0][1][1] < resultados[1][1][1]) {
        return resultados[1][0]
    } else {
        // comparar o life
        if (resultados[0][1][0] > resultados[1][1][0]) {
            return resultados[0][0]
        } else if (resultados[0][1][0] < resultados[1][1][0]) {
            return resultados[1][0]
        } else {
            error(mensagem_anterior, 14785232, `${resultados}; na mensagem anterior a mana e a vida são iguais.`)
            return null
        }
    }
}

module.exports = { comparar_mana_da_penultima_placa_parcial_de_luta }
