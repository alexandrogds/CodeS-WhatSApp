

function calcularProximidade(message, palavras) {
	const linhas = message.split(/\r?\n/);

	const indicesPalavras = {};
	for (let idx = 0; idx < linhas.length; idx++) {
		const linha = linhas[idx];
		for (const palavra of palavras) {
			if (linha.toLowerCase().includes(palavra.toLowerCase())) {
				indicesPalavras[palavra] = idx;
			}
		}
	}

	const indicesNumeros = {};
	for (let idx = 0; idx < linhas.length; idx++) {
		const linha = linhas[idx];
		if (temZerosConsecutivos(linha)) {  // Call the temZerosConsecutivos function
			const numeros = linha.match(/(?<!\d)[0-9]{1,3}(?!\d)/g);
			if (numeros) {
				indicesNumeros[idx] = numeros.map(Number); // Convert to numbers
			}
		}
	}

	const resultados = [];
	// const resultados = {};
	for (const palavra in indicesPalavras) {
		let menorDistancia = Infinity;
		let linhaNumerosProxima = null;
		const idxPalavra = indicesPalavras[palavra];

		for (const idxNum in indicesNumeros) {
			const numeros = indicesNumeros[idxNum];
			if (numeros.length >= 2) {
				const distancia = Math.abs(idxPalavra - idxNum);
				if (distancia <= menorDistancia) {
					menorDistancia = distancia;
					linhaNumerosProxima = numeros;
				}
			}
		}
		resultados.push([palavra, linhaNumerosProxima]);
	}

	return resultados;
}

// Helper function (replace with your actual implementation)
function temZerosConsecutivos(linha) {
	// This is a placeholder.  Implement your logic to check for consecutive zeros
	// The Python code example didn't include this function's implementation.
	// Example (adjust as needed):
	return linha.includes("00"); // Or a more robust check for consecutive zeros.
}

// Example usage:
// const linhas = [
// 	"Nome: Jogador1",
// 	"Vida: 0 40",   // Example with consecutive zeros
// 	"Mana: 20 60",
// 	"Nome: Jogador2",
// 	"Vida: 0 0",    // Another Example with consecutive zeros
// 	"Mana: 30 50",
// ];
// const palavras = ["Nome"];
// const resultados = calcularProximidade(linhas, palavras);
// console.log(resultados);

module.exports = { calcularProximidade }
