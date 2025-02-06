

const { zip } = require('./lib')

function determineWinnerOneFlag(flagPart, resultados) {
	// entrou aqui os life são iguais
	// assim precisa verificar a diferença na mana
	const playerIndex = parseInt(flagPart[0], 10);
	const otherPlayerIndex = 1 - playerIndex; // Get index of the other player
	const stat = flagPart.slice(4); // Extract "mana" or "vida"

	if (stat === "mana;") {
		if (resultados[playerIndex][1][1] < resultados[otherPlayerIndex][1][1]) {
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[otherPlayerIndex][0])];
		} else if (resultados[playerIndex][1][1] > resultados[otherPlayerIndex][1][1]) {
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex][0])];
		}
	} else if (stat === "vida;") {
		if (resultados[playerIndex][1][2] < resultados[otherPlayerIndex][1][1]) { // Correct index for vida
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[otherPlayerIndex][0])];
		} else if (resultados[playerIndex][1][2] > resultados[otherPlayerIndex][1][1]) { // Correct index for vida
			return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex][0])];
		}
	}
	return null; // Handle ties or invalid stat
}

function determineWinnerTwoFlags(flagParts, resultados) {
	// entrou aqui os life são iguais
	// assim precisa verificar a diferença na mana
	const parts = flagParts.split(";");
	const playerIndex1 = parseInt(parts[0][0], 10);
	const otherPlayerIndex1 = 1 - playerIndex; // Get index of the other player
	const playerIndex2 = parseInt(parts[1][0], 10);
	// const otherPlayerIndex2 = 1 - playerIndex; // Get index of the other player
	let stat1 = parts[0].slice(4); // Extract "mana" or "vida" from first flag part
	let stat2 = parts[1].slice(4);

	if (playerIndex1 != playerIndex2) {
		if (stat1 === "mana" && stat2 === "mana") {
			// mana não deslocada
			if (resultados[playerIndex1][1][1] < resultados[playerIndex2][1][1]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex2][0])]
			} else if (resultados[playerIndex1][1][1] > resultados[playerIndex2][1][1]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex2][0])]
			}
		} else if (stat1 === "mana" && stat2 === "vida") {
			// mana deslocada para playerIndex2
			if (resultados[playerIndex1][1][1] < resultados[playerIndex2][1][2]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex2][0])]
			} else if (resultados[playerIndex1][1][1] > resultados[playerIndex2][1][2]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex1][0])]
			}
		} else if (stat1 === "vida" && stat2 === "mana") {
			// mana deslocada para playerIndex1
			if (resultados[playerIndex1][1][2] < resultados[playerIndex2][1][1]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex2][0])]
			} else if (resultados[playerIndex1][1][2] > resultados[playerIndex2][1][1]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex1][0])]
			}

		} else if (stat1 === "vida" && stat2 === "vida") {
			// mana deslocada para playerIndex1 e playerIndex2
			if (resultados[playerIndex1][1][2] < resultados[playerIndex2][1][2]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex2][0])]
			} else if (resultados[playerIndex1][1][2] > resultados[playerIndex2][1][2]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex1][0])]
			}
		}
	} else {
		if (stat1 === "mana" && stat2 === "vida") {
			if (resultados[playerIndex1][1][1] < resultados[otherPlayerIndex1][1][2]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[otherPlayerIndex1][0])]
			} else if (resultados[playerIndex1][1][1] > resultados[otherPlayerIndex1][1][2]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex1][0])]
			}
		} else if (stat1 === "vida" && stat2 === "mana") {
			if (resultados[playerIndex1][1][2] < resultados[otherPlayerIndex1][1][1]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[otherPlayerIndex1][0])]
			} else if (resultados[playerIndex1][1][2] > resultados[playerIndex2][1][1]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex1][0])]
			}
		}
	}
	return null; // Handle ties or other invalid combinations
}

async function handleOneFlag(a99, resultados) {
	const winner = determineWinnerOneFlag(a99[0], resultados);
	if (winner !== null) {
		return winner
	}
}

function handleTwoFlags(a99, resultados) {
	const winner = determineWinnerTwoFlags(a99, resultados);

	if (winner !== null){
		return winner
	}
}

function determineWinner3Flags(a99, resultados) {
	// entrou aqui os life são iguais
	// assim precisa verificar a diferença na mana
	const parts = flagParts.split(";");
	const playerIndex1 = parseInt(parts[0][0], 10);
	const otherPlayerIndex1 = 1 - playerIndex1; // Get index of the other player
	const playerIndex2 = parseInt(parts[1][0], 10);
	const otherPlayerIndex2 = 1 - playerIndex2; // Get index of the other player
	const playerIndex3 = parseInt(parts[2][0], 10);
	const otherPlayerIndex3 = 1 - playerIndex3; // Get index of the other player
	const stat1 = parts[0].slice(4); // Extract "mana" or "vida" from first flag part
	const stat2 = parts[1].slice(4);
	const stat3 = parts[2].slice(4);



	//if (playerIndex1 != playerIndex2) {
		if (stat1 === "mana" && stat2 === "mana" && stat3 === 'vida') {
			if (playerIndex1 == 0)
			if (resultados[playerIndex1][1][1] < resultados[playerIndex2][1][1]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex2][0])]
			} else if (resultados[playerIndex1][1][1] > resultados[playerIndex2][1][1]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex2][0])]
			}
		} else if (stat1 === "mana" && stat2 === "vida") {
			if (resultados[playerIndex1][1][1] < resultados[playerIndex2][1][2]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex2][0])]
			} else if (resultados[playerIndex1][1][1] > resultados[playerIndex2][1][2]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex1][0])]
			}
		} else if (stat1 === "vida" && stat2 === "mana") {
			if (resultados[playerIndex1][1][2] < resultados[playerIndex2][1][1]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex2][0])]
			} else if (resultados[playerIndex1][1][2] > resultados[playerIndex2][1][1]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex1][0])]
			}

		} else if (stat1 === "vida" && stat2 === "vida") {
			if (resultados[playerIndex1][1][2] < resultados[playerIndex2][1][2]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex2][0])]
			} else if (resultados[playerIndex1][1][2] > resultados[playerIndex2][1][2]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex1][0])]
			}
		}
	} else {
		if (stat1 === "mana" && stat2 === "vida") {
			if (resultados[playerIndex1][1][1] < resultados[otherPlayerIndex1][1][2]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[otherPlayerIndex1][0])]
			} else if (resultados[playerIndex1][1][1] > resultados[otherPlayerIndex1][1][2]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex1][0])]
			}
		} else if (stat1 === "vida" && stat2 === "mana") {
			if (resultados[playerIndex1][1][2] < resultados[otherPlayerIndex1][1][1]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[otherPlayerIndex1][0])];
			} else if (resultados[playerIndex1][1][2] > resultados[playerIndex2][1][1]) {
				return nickSOfMessage[nickSOfMessage.indexOf(resultados[playerIndex1][0])];
			}
		}
	}
}

function handle3Flags(a99, resultados) {
	const winner = determineWinner3Flags(a99, resultados);

	if (winner !== null){
		return winner
	}
}

function determineWinner4Flags(a99, resultados) {
	// entrou aqui os life são iguais
	// assim precisa verificar a diferença na mana

}

function handle4Flags(a99, resultados) {
	const winner = determineWinner4Flags(a99, resultados);

	if (winner !== null){
		return winner
	}
}

// ... (registrar_pontos function and other code)
module.exports = { handleOneFlag, handleTwoFlags, handle3Flags, handle4Flags };
