

const dotenv = require('dotenv')
const { readFile } = require('../myfs')  // Use promises for easier async handling

dotenv.config({ path: '../.env' });

async function getNicksFromFile(filePath) {
	try {
		const fileContent = await readFile(filePath, 'utf-8');
		const nicks = fileContent.split(/\r?\n/).filter(nick => nick.trim() !== ""); // Split into lines and remove empty lines
		return nicks;
	} catch (error) {
		console.error("Error reading nicks file:", error);
		return []; // Return an empty array if there's an error
	}
}

// Example usage:
async function getNicks() {
	const filePath = process.env.FILE_WITH_NICKS_DA_ARENA_SC
	const nicks = await getNicksFromFile(filePath);
	// if (nicks.length === 0){
	//     console.log(`Empty Nick List`)
	// }
	return nicks
}

async function getNickSOfMessage(message) {

	// ... other code ...
	const nicks = await getNicks(); // Call the async function to get the nicks

	const _nicks = [];

	for (const nick of nicks) {
		const pattern = nick.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();  // Normalize to lowercase
		const regex = new RegExp(`\\b${pattern}\\b`, 'g'); // Use word boundaries and global flag
		const resultados = message.body.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(regex) || [];

		if (resultados.length > 0) {
			_nicks.push(nick.toLowerCase());
		}
	}
	if (process.env.DEBUG == 'true') {
		console.log(_nicks)
	}
	return _nicks;
}

module.exports = { getNickSOfMessage }
