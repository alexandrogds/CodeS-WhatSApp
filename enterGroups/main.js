const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const palavra = 'anime'

// Initialize the client
const client = new Client({
	authStrategy: new LocalAuth(),
	puppeteer: { headless: true }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('Client is ready!');
    // Lê todos os arquivos da pasta ../groupsWpp/palavra e extrai os links
    const groupLinksDir = path.resolve(__dirname, '../groupsWpp', palavra);
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
        console.error('Erro ao ler os links dos grupos:', err);
        return;
    }
    for (let i = 0; i < ids.length; i++) {
		const inviteCode = extractInviteCode(ids[i]);
		console.log('Invite code:', inviteCode);
		const chat_id = await joinGroupByInvite(inviteCode);

        // Buscar o chat pelo id para obter os participantes
        if (chat_id) {
            const chat = await client.getChatById(chat_id);
            if (chat && chat.participants) {
                const numbersDir = path.resolve(__dirname, '../numbersWpp', palavra);
                if (!fs.existsSync(numbersDir)) {
                    fs.mkdirSync(numbersDir, { recursive: true });
                }
				console.log('Chat:', chat);
                const filePath = path.join(numbersDir, `${chat.id.user || chat.id._serialized}.db`);
                const participantsList = chat.participants.map(p => p.id.user).join('\n');
                fs.writeFileSync(filePath, participantsList, 'utf8');
                console.log(`Participantes salvos em: ${filePath}`);
            }
        }
    }
});

client.on('group_update', (notification) => {
	console.log('Group update:', notification);
});
// nao esta funcionando
client.on('group_join', () => {
	console.log('You have been invited to a group!');
});

// Função para extrair o código do link ou retornar o código se já for
function extractInviteCode(input) {
    // Regex para extrair o código do link
    const match = input.match(/(?:chat\.whatsapp\.com\/)?([A-Za-z0-9]{20,})/);
    if (match && match[1]) {
        return match[1];
    }
    throw new Error('Invalid invite code or link: ' + input);
}

// Example usage of client.acceptInvite(inviteCode)
async function joinGroupByInvite(inviteCode) {
    try {
        const chat_id = await client.acceptInvite(inviteCode);
        console.log(`Joined group: ${chat_id}`);
        return chat_id;
    } catch (error) {
        console.error('Failed to join group:', error);
        throw error;
    }
}

client.initialize();