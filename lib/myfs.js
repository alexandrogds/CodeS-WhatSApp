const fs = require('fs/promises'); 
const path = require('path');

async function appendFile(path, data) {  // Make the function async
	try {
		let toWrite = data.endsWith('\n') ? data : data + '\n';
		await fs.appendFile(path, toWrite, 'utf-8'); // Add newline and specify UTF-8
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
		console.log('arquivo lido')
		return content;
	} catch (error) {
		console.error('Error reading file:', error);
		return null;
	}
}

async function writeFile(file_path, data) {
	try {
		await fs.mkdir(path.dirname(file_path), { recursive: true });
		await fs.writeFile(file_path, data, 'utf-8');
		return true;
	} catch (error) {
		console.error('Error write file:', error);
		return null;
	}
}

module.exports = { appendFile, readFile, writeFile };
