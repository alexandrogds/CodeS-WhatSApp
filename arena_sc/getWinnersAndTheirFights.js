
async function getWinnersAndTheirFights(winners) { // Make the function async
	// let data = await readFile(process.env.WINNERS_ARENA_SC); // Use await to wait for the file
	// let winnerJson = JSON.parse(data)
	// ... rest of the code
	const winnerCounts = {};

	winners.forEach(winnerJson => {
		const winner = winnerJson.winner;
		winnerCounts[winner] = (winnerCounts[winner] || 0) + 1;
	});

	return winnerCounts;
}

module.exports = { getWinnersAndTheirFights }
