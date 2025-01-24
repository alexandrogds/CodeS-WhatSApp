const { readFile } = require('./myfs.js')

async function getNickSUniCode() {
    const pathNickSUniCode = String.raw`C:\Users\user\OneDrive\RPG's\Chapéus De Palha _ Alex Thierry\Membros (Mar, Patentes E Números De Celular).md`;
    const bufferNickSUniCode = Buffer.from(pathNickSUniCode, 'utf-8');
    try {
        const content = await readFile(bufferNickSUniCode, 'utf-8'); // Specify UTF-8 encoding
        const lines = content.split('\n');
        const result = lines.map(line => {
            if (line.trim() == '') {
                return ''
            }
            const result = line.match(/[^\d+\r-]+/g).join('');
            return result.trim()
        });
        return result;
    } catch (error) {
        console.error("Error reading or processing file:", error);
        return []; // Return an empty array in case of error
    }
}

module.exports = getNickSUniCode
