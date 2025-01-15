const error = require('./error')  // Use promises for easier async handling

function analyzeResults(resultados, mensagem_anterior, numbers) {
	if (resultados.length === 0) {
		error(mensagem_anterior, numbers, '23');
		return null; // Or handle the error differently
	}

	let flag = '';

	if ((resultados[0][1].length !== 2 || resultados[1][1].length !== 2) && !flag) {
		// Handle the cases where length is 3 (effects present)
		if (resultados[0][1].length === 3) {
			if (resultados[0][1].filter(x => x === Math.min(...resultados[0][1])).length === 1) { // Count occurrences of min value
				const minIndex = resultados[0][1].indexOf(Math.min(...resultados[0][1]));
				if (minIndex === 2) {
					flag += '0 && mana;';
				} else if (minIndex === 1) {
					flag += '0 && vida;';
				} else {
					error(mensagem_anterior, numbers, '30', `\nRESULTADOS = ${JSON.stringify(resultados)}`); // Use JSON.stringify
					return null; // Or handle error as needed
				}
			}
		}

		if (resultados[1][1].length === 3) {
			if (resultados[1][1].filter(x => x === Math.min(...resultados[1][1])).length === 1) {
				const minIndex = resultados[1][1].indexOf(Math.min(...resultados[1][1]));
				if (minIndex === 2) {
					flag += '1 && mana;';
				} else if (minIndex === 1) {
					flag += '1 && vida;';
				} else {
					error(mensagem_anterior, numbers, '31', `\nRESULTADOS = ${JSON.stringify(resultados)}`);
					return null;// Or handle error as needed
				}
			}
		}
	}

	return flag;
}

module.exports = analyzeResults;
