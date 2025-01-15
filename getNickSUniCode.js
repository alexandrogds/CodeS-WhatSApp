const { readFile } = require('./fs2.js')

async function getNickSUniCode() {
    const pathNickSUniCode = "C:\\Users\\user\\OneDrive\\RPGs\\Chap�us De Palha - Alex Thierry\\Membros (Mar, Patentes E N�meros De Celular).md";
    try {
        const content = await readFile(pathNickSUniCode, 'utf-8'); // Specify UTF-8 encoding
        const lines = content.split('\n');
        const result = lines.map(line => {
            const words = line.trim().split(' '); // Trim to remove leading/trailing whitespace
            return words.length > 1 ? words[1] : words[0]; //default to "0" if no second word
        });
        return result;
    } catch (error) {
        console.error("Error reading or processing file:", error);
        return []; // Return an empty array in case of error
    }
}

module.exports = getNickSUniCode
