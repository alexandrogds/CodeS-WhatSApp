

const fs = require('fs')

function getNickS() {
    /**
     * Reads a file and returns its lines as an array of strings.
     *
     * @param {string} filepath - The path to the file.
     * @returns {Promise<string[]>} A promise that resolves with an array of strings, 
     * where each element is a line from the file, or rejects with an error.  
     * Resolves with an empty array if the file is empty.
    */
    const filepath = process.env.FILE_WITH_NICKS_DA_ARENA_SC
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.error(`Error: File not found at '${filepath}'`);
                    resolve([]) //Resolve with empty array if file not found
                } else {
                    reject(err); //Reject with the error if it's not a file not found error
                }

            } else {
                const lines = data.split('\n').map(line => line.trim()); //split into lines and remove extra whitespace
                resolve(lines);  // Resolve with the array of lines
            }

        });
    });
}

module.exports = { getNickS }
