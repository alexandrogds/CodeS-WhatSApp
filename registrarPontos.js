function registrar_pontos(telefones, juizes_e_os_players_da_luta, quem_enviou_a_mensagem_anterior__juiz, nicks_e_seus_telefones, data_hora_da_ultima_tabela, dia, mes, ano, nicks, data_hora_objeto, dia_semana_numero, aux_dia_semana_numero, nicks_e_suas_quantidade_de_vitorias, datas_nicks_e_suas_quantidade_de_vitorias, meses_e_nicks_com_suas_quantidade_de_vitorias, periodo_mensal, periodo_semanal, _nicks, vencedor) {
    if (!telefones.includes(quem_enviou_a_mensagem_anterior__juiz)) {
        if (!(periodo_semanal in juizes_e_os_players_da_luta)) {
            juizes_e_os_players_da_luta[periodo_semanal] = {};
        }
        juizes_e_os_players_da_luta[periodo_semanal][quem_enviou_a_mensagem_anterior__juiz] = { players: _nicks, info: 'Marcar a pessoa pelo número e perguntar qual o nick.' };
    } else {
        if (!(periodo_semanal in juizes_e_os_players_da_luta)) {
            juizes_e_os_players_da_luta[periodo_semanal] = {};
        }
        const juizNick = nicks_e_seus_telefones[telefones.indexOf(quem_enviou_a_mensagem_anterior__juiz)][0].toLowerCase();
        if (!_nicks.includes(juizNick)) {
            if (juizNick in juizes_e_os_players_da_luta[periodo_semanal]) {
                juizes_e_os_players_da_luta[periodo_semanal][juizNick] += 1;
            } else {
                juizes_e_os_players_da_luta[periodo_semanal][juizNick] = 1;
            }
        }
    }

    // Increment win counts (ensure these properties exist first if necessary)

    meses_e_nicks_com_suas_quantidade_de_vitorias[periodo_mensal] = meses_e_nicks_com_suas_quantidade_de_vitorias[periodo_mensal] || {}; // if not defined, creates the property initialized with an empty object
    meses_e_nicks_com_suas_quantidade_de_vitorias[periodo_mensal][vencedor] = (meses_e_nicks_com_suas_quantidade_de_vitorias[periodo_mensal][vencedor] || 0) + 1;

    datas_nicks_e_suas_quantidade_de_vitorias[periodo_semanal] = datas_nicks_e_suas_quantidade_de_vitorias[periodo_semanal] || {};
    datas_nicks_e_suas_quantidade_de_vitorias[periodo_semanal][vencedor] = (datas_nicks_e_suas_quantidade_de_vitorias[periodo_semanal][vencedor] || 0) + 1;

    nicks_e_suas_quantidade_de_vitorias[vencedor] = (nicks_e_suas_quantidade_de_vitorias[vencedor] || 0) + 1;

    return [aux_dia_semana_numero, periodo_semanal, datas_nicks_e_suas_quantidade_de_vitorias, meses_e_nicks_com_suas_quantidade_de_vitorias, nicks_e_suas_quantidade_de_vitorias, data_hora_da_ultima_tabela, juizes_e_os_players_da_luta];
}

// Export the function
module.exports = { registrar_pontos };
