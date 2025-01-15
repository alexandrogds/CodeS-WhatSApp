const fs = require('fs/promises'); 

async function appendToFile(path, data) {  // Make the function async
	try {
		await fs.appendFile(path, data + '\n', 'utf-8'); // Add newline and specify UTF-8
		// Log success (optional)
		// console.log(`Data appended to ${path}`);
	} catch (err) {
		console.error(`Error appending to file ${path}:`, err);
		return null;
		// Handle the error appropriately (e.g., send a message, exit, etc.)
	}
}

async function readFile(path) {
	try {
		const content = await fs.readFile(path, 'utf-8');
		return content;
	} catch (error) {
		console.error('Error reading Dragon Gakure members file:', error);
		return null;
	}
}

module.exports = { appendToFile, readFile };
