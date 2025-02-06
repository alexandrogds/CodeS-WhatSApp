

const error = require('../error')
const { definir_vencedor_tendo_buffs_debuffs_na_linha_de_atributos_principais } = require('./definir_vencedor_tendo_buffs_debuffs_na_linha_de_atributos_principais')

function resolve_flag_debuffs_e_buffs(resultados, configuracao, mensagem_anterior, message, nickSOfMessage, numbers, dataHoraUser) {
	// configuracao é a variavel flag
    //const configs = configuracao.split(';');
    const configs = configuracao
    let manas = [];
    let indices = [];

    // Validação inicial: configs deve ter entre 1 e 4 elementos
    // max 2 debuff/buff na linha de vida/mana
    // debuf/buff na vida colocado após a vida
    // debuf/buff na mana colocado após a mana
    if (configs.length < 1 || configs.length > 4) {
        error(message.body, 159852357845698, "Configuração (flag) inválida: deve ter entre de 1 à 4 elementos.");
        return null
    }

    for (let i = 0; i < configs.length; i++) {
        const [indiceStr, tipo] = configs[i].split(' ');
        const indice = parseInt(indiceStr);
        indices.push(indice);
        const resultadoAtual = resultados[indice][1];

        // resultadoAtual.length igual a 2 não entra aqui pois não tem debuff/buff
        // resultadoAtual.length igual a 1 é erro pois precisa haver na mesma linha os dados de vida e mana
        if (resultadoAtual.length === 3) {
            manas.push(tipo === 'vida' ? resultadoAtual[2] : resultadoAtual[1]);
        } else if (resultadoAtual.length === 4) {
            manas.push(resultadoAtual[2]);
        } else {
            error(message.body, 74125896321456, `${resultados}; pode haver algum erro pois em relação aos resultados de calcularProximidade nem 2 nem 1 nem outro valor devia passar por essa função`);
            return null
        }
    }

    // Lógica de comparação com base no tamanho de configs
    if (configs.length === 1) {
        if (manas[0] > resultados[1 - indices[0]][1][1]) {
            return resultados[indices[0]][0]
        } else if (manas[0] < resultados[1 - indices[0]][1][1]) {
            return resultados[1 - indices[0]][0]
        } else {
            // verificar mensagem anterior
            return definir_vencedor_tendo_buffs_debuffs_na_linha_de_atributos_principais(resultados, mensagem_anterior, nickSOfMessage, numbers, dataHoraUser, mensagem_anterior)
        }
    } else if (configs.length === 2) {
      if (manas[0] > manas[1]) {
          return resultados[indices[0]][0]
      } else if (manas[0] < manas[1]) {
          return resultados[indices[1]][0]
      } else {
        // verificar mensagem anterior
        return definir_vencedor_tendo_buffs_debuffs_na_linha_de_atributos_principais(resultados, mensagem_anterior, nickSOfMessage, numbers, dataHoraUser, mensagem_anterior)
      }
    } else if (configs.length === 3 || configs.length === 4) {
        let maiorMana = manas[0];
        let indicesMaiorMana = [indices[0]]; // Array para guardar índices

        for (let i = 1; i < manas.length; i++) {
            if (manas[i] > maiorMana) {
                maiorMana = manas[i];
                indicesMaiorMana = [indices[i]]; // Novo maior, reinicia array
            } else if (manas[i] === maiorMana) {
                indicesMaiorMana.push(indices[i]); // Mesma mana, adiciona índice
            }
        }
    
        if (indicesMaiorMana.length === 1) {
            return resultados[indicesMaiorMana[0]][0];
        } else if (indicesMaiorMana.length === 2) {
            // verificar mensagem anterior
            return definir_vencedor_tendo_buffs_debuffs_na_linha_de_atributos_principais(resultados, mensagem_anterior, nickSOfMessage, numbers, dataHoraUser, mensagem_anterior)
        } else {
            error(message.body, 74185293147258, 'mais de 2 indices iguais para a mana')
            return null
        }
    }
}

module.exports = { resolve_flag_debuffs_e_buffs }
