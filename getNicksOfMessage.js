const { readFile } = require('./myfs')  // Use promises for easier async handling

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
	const filePath = String.raw`C:/Users/user/OneDrive/RPG's/Chapéus De Palha _ Alex Thierry/nicks.md`
	const nicks = await getNicksFromFile(filePath);
	// if (nicks.length === 0){
	//     console.log(`Empty Nick List`)
	// }
	return nicks
}

async function getNicksOfMessage(message) {

	// ... other code ...
	const nicks = await getNicks(); // Call the async function to get the nicks

	let nick_count = 0;
	const _nicks = [];

	for (const nick of nicks) {
		const pattern = nick.toLowerCase();  // Normalize to lowercase
		const regex = new RegExp(`\\b${pattern}\\b`, 'g'); // Use word boundaries and global flag
		const resultados = message.body.toLowerCase().match(regex) || [];

		if (resultados.length > 0) {
			nick_count++;
			_nicks.push(nick.toLowerCase());
		}
	}
	return _nicks;
}

module.exports = getNicksOfMessage; 
