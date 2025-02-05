const fs = require('fs/promises'); 

async function appendFile(path, data) {  // Make the function async
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
		console.log(`iniciando leitura do arquivo ${path}`)
		const content = await fs.readFile(path, 'utf-8');
		console.log('arquivo lido, retornando content')
		return content;
	} catch (error) {
		console.error('Error reading file:', error);
		return null;
	}
}

async function writeFile(path, data) {
	try {
		await fs.writeFile(path, data, 'utf-8');
		return true;
	} catch (error) {
		console.error('Error write file:', error);
		return null;
	}
}

module.exports = { appendFile, readFile, writeFile };
