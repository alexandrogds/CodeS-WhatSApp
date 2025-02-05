const { registrar_pontos } = require('./registrarPontos'); // Use promises for easier async handling

function determineWinnerOneFlag(flagPart, resultados) {
	const playerIndex = parseInt(flagPart[0], 10);
	const stat = flagPart.slice(4); // Extract "mana" or "vida"


	if (stat === "mana") {
		if (resultados[0][1][1] < resultados[1][1][1]) {
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[1][0])];
		} else if (resultados[0][1][1] > resultados[1][1][1]) {
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[0][0])];
		}
	} else if (stat === "vida") {
		const otherPlayerIndex = 1 - playerIndex; // Get index of the other player
		if (resultados[playerIndex][1][2] < resultados[otherPlayerIndex][1][1]) { // Correct index for vida
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[otherPlayerIndex][0])];
		} else if (resultados[playerIndex][1][2] > resultados[otherPlayerIndex][1][1]) { // Correct index for vida
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex][0])];
		}
	}
	return null; // Handle ties or invalid stat
}

function determineWinnerTwoFlags(flagParts, resultados) {
	let stat1 = flagParts[0].slice(4); // Extract "mana" or "vida" from first flag part
	let stat2 = flagParts[1].slice(4);


	if (stat1 === "mana" && stat2 === "mana") {
		if (resultados[0][1][1] < resultados[1][1][1]) {
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[1][0])];
		} else if (resultados[0][1][1] > resultados[1][1][1]) {
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[0][0])];
		}

	} else if (stat1 === "mana" && stat2 === "vida") {
		if (resultados[0][1][2] < resultados[1][1][2]) {
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[1][0])];
		} else if (resultados[0][1][2] > resultados[1][1][2]) {
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[0][0])];
		}
	} else if (stat1 === "vida" && stat2 === "mana") {
		if (resultados[0][1][2] < resultados[1][1][1]) {
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[1][0])];
		} else if (resultados[0][1][2] > resultados[1][1][1]) {
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[0][0])];
		}

	} else if (stat1 === "vida" && stat2 === "vida") {
		if (resultados[0][1][2] < resultados[1][1][2]) {
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[1][0])];
		} else if (resultados[0][1][2] > resultados[1][1][2]) {
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[0][0])];
		}
	}
	return null; // Handle ties or other invalid combinations
}

async function handleOneFlag(a99, resultados, telefones, juizes_e_os_players_da_luta, quem_enviou_a_mensagem_anterior__juiz, nicks_e_seus_telefones, data_hora_da_ultima_tabela, dia, mes, ano, nicks, data_hora_objeto, dia_semana_numero, aux_dia_semana_numero, nicks_e_suas_quantidade_de_vitorias, datasnickSOfMessage_e_suas_quantidade_de_vitorias, meses_enickSOfMessage_com_suas_quantidade_de_vitorias, periodo_mensal, periodo_semanal, nickSOfMessage, registrarPontosHelper) {
	const winner = determineWinnerOneFlag(a99[0], resultados);
	if (winner !== null) {
		return winner
	}
}

function handleTwoFlags(a99, resultados, telefones, juizes_e_os_players_da_luta, quem_enviou_a_mensagem_anterior__juiz, nicks_e_seus_telefones, data_hora_da_ultima_tabela, dia, mes, ano, nicks, data_hora_objeto, dia_semana_numero, aux_dia_semana_numero, nicks_e_suas_quantidade_de_vitorias, datasnickSOfMessage_e_suas_quantidade_de_vitorias, meses_enickSOfMessage_com_suas_quantidade_de_vitorias, periodo_mensal, periodo_semanal, nickSOfMessage) {
	const winner = determineWinnerTwoFlags(a99, resultados);

	if (winner !== null){
		return winner
	}
}

// ... (registrar_pontos function and other code)
module.exports = { handleOneFlag, handleTwoFlags, determineWinnerTwoFlags };
