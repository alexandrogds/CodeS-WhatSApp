const { readFile } = require('./fs2.js')

async function winnersAndTheirFights() { // Make the function async
	const winnerData = await readFile(process.env.FILEPATH_NICK_NUMBER_DATA_OF_NICK_VENCEDOR_ARENA_SC); // Use await to wait for the file
	winnerData = JSON.parse(winnerData)
	// ... rest of the code
	const winnerCounts = {};

	fileContent.forEach(winnerData => {
		const vencedor = winnerData.vencedor;
		winnerCounts[vencedor] = (winnerCounts[vencedor] || 0) + 1;
	});

	return winnerCounts;
}

module.exports = winnersAndTheirFights
