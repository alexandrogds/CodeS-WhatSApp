const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');

const groupsDir = path.join(__dirname, '..', 'groupsWpp', 'anime');

// Lê todas as URLs dos arquivos na pasta groupsWpp\anime
function getInviteCodesFromFiles() {
    const files = fs.readdirSync(groupsDir);
    const inviteCodes = [];
    files.forEach(file => {
        const filePath = path.join(groupsDir, file);
        const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
        lines.forEach(line => {
            const code = extractInviteCode(line.trim());
            if (code) inviteCodes.push(code);
        });
    });
    return inviteCodes;
}

// Salva no formato `${invite code}\t${id}`
function saveInviteCodeAndId(inviteCode, groupId) {
}

// Função utilitária para delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const client = new Client({
		authStrategy: new LocalAuth(),
		puppeteer: { headless: true }
	});
    client.on('ready', async () => {
        let inviteCodes = getInviteCodesFromFiles();
		// inviteCodes = ['Jpf1oyBC93YExDp2NZjM7d']
        for (const code of inviteCodes) {
            await sleep(2000); // Delay de 1 segundo no início do loop
            try {
				try {
					var info = await client.getInviteInfo(code);
					if (info && info.id) {
						chat_id = info.id._serialized || info.id;
						console.log('Obtido chat_id via getInviteInfo:', chat_id);
					}
				} catch (e) {
					console.log('Não foi possível obter chat_id via getInviteInfo:', e.message);
					const expiredPath = path.resolve(__dirname, 'linkExpired.db');
					const now = new Date().toISOString().slice(0,19) + 'Z'; // YYYY-MM-DDTHH:mm:ssZ
					fs.appendFileSync(expiredPath, `${code}\t${now}\n`, 'utf8');
					console.log(`Invite code expirados salvos em: ${expiredPath}`);
					continue
				}
                // chat.id._serialized é o ID do grupo
                saveInviteCodeAndId(code, info.id._serialized || info.id);
                // Opcional: sair do grupo após pegar o ID
                // await client.groupLeave(chat.id._serialized);
            } catch (e) {
                console.error(`Erro ao processar código ${code}:`, e.message);
            }
        }
        client.destroy();
    });
    client.initialize();
}

main();