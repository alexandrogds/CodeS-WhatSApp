const fs = require('fs');
const path = require('path');

// Função para extrair o código do link ou retornar o código se já for
function extractInviteCode(input) {
    // Regex para extrair o código do link
    const match = input.match(/(?:chat\.whatsapp\.com\/)?([A-Za-z0-9]{20,})/);
    if (match && match[1]) {
        return match[1];
    }
    console.log('Invalid invite code or link: ' + input);
}
function getAllLinesOfAllFilesOfOneFolder(groupLinksDir) {
	let ids = [];
	try {
		const files = fs.readdirSync(groupLinksDir);
		for (const file of files) {
			const filePath = path.join(groupLinksDir, file);
			const content = fs.readFileSync(filePath, 'utf8');
			const links = content.split('\n').map(l => l.trim()).filter(l => l);
			ids.push(...links);
		}
	} catch (err) {
		console.error('Erro ao ler as linhas do arquivo:', err);
		return;
	}
	return ids;
}
// Example usage of client.acceptInvite(inviteCode)
async function joinGroupByInvite(inviteCode, client) {
    try {
        const chat_id = await client.acceptInvite(inviteCode);
        console.log(`"Joined" group: ${chat_id}`);
        return chat_id;
    } catch (error) {
        console.error('function joinGroupByInvite: Failed to join group.');
        // throw error;
    }
}
module.exports = { extractInviteCode, getAllLinesOfAllFilesOfOneFolder,
	joinGroupByInvite
 };
