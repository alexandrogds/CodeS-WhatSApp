const { readFile } = require('./fs2')  // Use promises for easier async handling

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
	const filePath = 'C:/Users/user/OneDrive/RPGs/Chapéus De Palha - Alex Thierry/nicks.md';
	const nicks = await getNicksFromFile(filePath);
	// if (nicks.length === 0){
	//     console.log(`Empty Nick List`)
	// }
	return nicks
}

async function getNicksOfMessage(message) {

    if (message.from === process.env.ARENASC) {
        // ... other code ...
		const nicks = await getNicks(); // Call the async function to get the nicks
		const result = getNicksOfMessage(message, nicks); // assuming getNicksOfMessage is defined correctly
        let mensagem_anterior = message.body; // ... get the message content ...

		let nick_count = 0;
        const _nicks = [];

        for (const nick of nicks) {
            const pattern = nick.toLowerCase();  // Normalize to lowercase
            const regex = new RegExp(`\\b${pattern}\\b`, 'g'); // Use word boundaries and global flag
            const resultados = mensagem_anterior.toLowerCase().match(regex) || [];

            if (resultados.length > 0) {
                nick_count++;
                _nicks.push(nick.toLowerCase());
            }
        }
	}
	return _nicks;
}

module.exports = getNicksOfMessage; 
