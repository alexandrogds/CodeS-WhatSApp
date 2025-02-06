

const error = require('../error')
const { comparar_mana_da_penultima_placa_parcial_de_luta } = require('./comparar_mana_da_penultima_placa_parcial_de_luta')
const { definir_vencedor_tendo_buffs_debuffs_na_linha_de_atributos_principais } = require('./definir_vencedor_tendo_buffs_debuffs_na_linha_de_atributos_principais')
const { determinar_vencedor_com_life_diferentes } = require('./determinar_vencedor_com_life_diferentes')

function definir_winner(message, nickSOfMessage, numbers, dataHoraUser, mensagem_anterior, resultados) {

    // fazer na mao todas as possibilidades de 0 à 3 daria 0,0 0,1 0,2 0,3 1,1 1,2 1,3 2,2 2,3 3,3
    // else if ( resultados[nickSOfMessage[0]]['status'].length == 2 ) {
    //     if (resultados[nickSOfMessage[1]]['status'].length == 2) {
    //         if (resultados[nickSOfMessage[0]]['status'][0] == 2) {

    //         }
    //     }
    // }










    // 0 && mana; _ 0 is first|top player
    // 1 && mana; _ 0 is second|botton player _ mana significa que o debuff|buff está na mana, após o número de mana
    // 0 && vida; _ vida significa que o debuff|buff está na vida, após o número de vida
    if (resultados[0][1][0] == 0 || resultados[1][1][0] == 0) {
        return determinar_vencedor_com_life_diferentes(resultados)
    } else if (resultados[0][1][0] === 0 && resultados[1][1][0] === 0) {
        // comparando a mana dos dois players
        if (resultados[0][1][1] < resultados[1][1][1]) {
            return resultados[1][0]
        } else if (resultados[0][1][1] > resultados[1][1][1]) {
            return resultados[0][0]
        } else {
            // verificar a mensagem anterior
            // compara mana e depois vida caso need
            return comparar_mana_da_penultima_placa_parcial_de_luta(mensagem_anterior)
        }
    } else if ((resultados[0][1].length !== 2 || resultados[1][1].length !== 2)) {
        return definir_vencedor_tendo_buffs_debuffs_na_linha_de_atributos_principais(resultados, message, nickSOfMessage, numbers, dataHoraUser, mensagem_anterior)
    } else {
        // não sei bem o que está ocorrendo quando entra aqui.
        // sei que se passar por aqui vai setar a mensagem anterior
        return null
    }
}

module.exports = { definir_winner }
