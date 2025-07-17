

const error = require('../error')
const { resolve_flag_debuffs_e_buffs } = require('./resolve_flag_debuffs_e_buffs.js')
const { determinar_vencedor_com_life_diferentes } = require('./determinar_vencedor_com_life_diferentes')

function definir_vencedor_tendo_buffs_debuffs_na_linha_de_atributos_principais(resultados, message, nickSOfMessage, numbers, dataHoraUser, mensagem_anterior){
    let flag = ''

    if (resultados[0][1].length === 3) {
        if (resultados[0][1].filter(x => x === Math.min(...resultados[0][1])).length === 1) { // Count occurrences of min value
            const minIndex = resultados[0][1].indexOf(Math.min(...resultados[0][1]));
            if (minIndex === 2) {
                flag += '0 && mana;';
            } else if (minIndex === 1) {
                flag += '0 && vida;';
            } else {
                error(message.body, '555111', `FLAG=${flag}; efeito sobre vida deslocado`); // Use JSON.stringify
                return null; // Or handle error as needed
            }
        } else {
            error(message.body, '6661', `FLAG=${flag}; PARTE NA LUTA COM BUFFS OU DEBUFFS COM OS NUMEROS MINIMOS DIFERENTES DE 1`)
            return
        }
    } else if (resultados[0][1].length === 4) {
        if (resultados[0][1][1] != 0 && resultados[0][1][3] != 0) {
            flag += '0 && mana; 0 && vida;';
        } else {
            error(message.body, '000011', `FLAG=${flag}; ESSA LUTA TEM SIMULTANEAMENTE DOIS EFEITOS SECUNDARIOS JUNTOS AO LIFE E CHAKRA`); // Use JSON.stringify
            return
        }
    } else {
        error(message.body, '666111', `FLAG=${flag}; ESSA LUTA TEM SIMULTANEAMENTE MAIS QUE DOIS EFEITOS SECUNDARIOS JUNTOS AO LIFE E CHAKRA`); // Use JSON.stringify
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
                error(message.body, '888811', `FLAG=${flag}; efeito sobre vida deslocado`); // Use JSON.stringify
                return null;// Or handle error as needed
            }
        }
    } else if(resultados[1][1].length === 4) {
        if (resultados[1][1][1] != 0 && resultados[1][1][3] != 0) {
            flag += '1 && mana; 1 && vida;';
        } else {
            error(message.body, '098456', `FLAG=${flag}; ESSA LUTA TEM SIMULTANEAMENTE DOIS EFEITOS SECUNDARIOS JUNTOS AO LIFE E CHAKRA`);
            return
        }
    } else {
        error(message.body, '777111', `FLAG=${flag}; ESSA LUTA TEM SIMULTANEAMENTE DOIS EFEITOS SECUNDARIOS JUNTOS AO LIFE E CHAKRA`);
        return
    }

    if (resultados[0][1][0] === 0 && resultados[1][1][0] === 0) {
        console.log('ENTROU<-123')
        const a99 = flag.split(';').filter(x => x !== '');
        return resolve_flag_debuffs_e_buffs(resultados, a99, mensagem_anterior, message, nickSOfMessage, numbers, dataHoraUser)
    } else {
        return determinar_vencedor_com_life_diferentes(resultados)
        // pode retornar null aqui na mensagem da penultima placa de luta
    }
}

module.exports = { definir_vencedor_tendo_buffs_debuffs_na_linha_de_atributos_principais }
