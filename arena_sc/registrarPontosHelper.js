const { registrarPontos } = require('./arena_sc/registrarPontos')

// Helper function to avoid redundant code for registrar_pontos calls
function registrarPontosHelper(vencedor) {
    const returned = registrarPontos(telefones, juizes_e_os_players_da_luta, quem_enviou_a_mensagem_anterior__juiz, nicks_e_seus_telefones, data_hora_da_ultima_tabela, dia, mes, ano, nicks, data_hora_objeto, dia_semana_numero, aux_dia_semana_numero, nicks_e_suas_quantidade_de_vitorias, datas_nicks_e_suas_quantidade_de_vitorias, meses_e_nicks_com_suas_quantidade_de_vitorias, periodo_mensal, periodo_semanal, _nicks, _nicks[_nicks.indexOf(vencedor)]);

    aux_dia_semana_numero = returned[0];
    periodo_semanal = returned[1];
    datas_nicks_e_suas_quantidade_de_vitorias = returned[2];
    meses_e_nicks_com_suas_quantidade_de_vitorias = returned[3];
    nicks_e_suas_quantidade_de_vitorias = returned[4];
    data_hora_da_ultima_tabela = returned[5];
    juizes_e_os_players_da_luta = returned[6];
    
    // Don't forget to update the main variables with the returned values. The current implementation returns the values, but does not update the external variables used in the function call.

}

module.exports = registrarPontosHelper;
