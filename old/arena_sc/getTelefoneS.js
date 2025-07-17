

const fs = require('fs')
const dotenv = require('dotenv')

dotenv.config({ path: './.env' });

async function getTelefoneS() {
    let filePath = process.env.FILE_WITH_NICKS_AND_TELEFONES_DA_ARENA_SC
    try {
        let fileContent = await fs.readFileSync(filePath, 'utf-8');
        let lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== "");

        let nicksETelefones = {};
        for (let line of lines) {
            let firstSpaceIndex = line.indexOf(' ');
            let nick = firstSpaceIndex === -1 ? line : line.substring(0, firstSpaceIndex);
            let telefone = firstSpaceIndex === -1 ? '' : line.slice(firstSpaceIndex)
            telefone = telefone.replace(/\D/g, "") || ''
            if (telefone == '') {
                //console.error(`No phone number found for nick: ${nick}`); // Or other error handling
                continue
            }
            nicksETelefones[nick.toLowerCase()] = telefone; // Return empty string if no numbers are found
        }

        return nicksETelefones;

    } catch (error) {
        console.error("Error getting nicks and phones file:", error);
        return {};  // Return an empty object if there's an error
    }
}

module.exports = { getTelefoneS }
