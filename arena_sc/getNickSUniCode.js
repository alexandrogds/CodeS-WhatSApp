

const { readFile } = require('../myfs.js')

async function getNickSUniCode() {
    const pathNickSUniCode = process.env.FILE_WITH_NICKS_TELEFONES_AND_PATENTES_DA_ARENA_SC
    try {
        const content = await readFile(pathNickSUniCode, 'utf-8'); // Specify UTF-8 encoding
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

module.exports = { getNickSUniCode }
