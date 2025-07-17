// o codigo precisa ser modularizado para previnir sobre carga nos endpoints
// um codigo para entrar, outro para extrair participantes e outro para sair do grupo
// lembrando que antes de fazer qualquer chamada ao endpoint no caso da extração
// é necessário verificar se o arquivo com os numeros existe e não está vazio
// no caso de sair do grupo antes de chamar os endpoints é o mesmo método, verificar
// se o arquivo existe de numeros do grupo existe e não está vazio com a verificação adicional
// de quando foi a entrada no grupo que deve ter um intervalo mínimo de estadia no
// grupo de 24h.

// parece que o arquivo com os grupos que existem ao processar as group_urls
// não está sendo usado, precisa-se utilizar para evitar sobrecarregar o endpoint
// de get_by_chat_id
/**
 * Script para gerenciar a entrada e extração de participantes de grupos do WhatsApp.
 * 
 * O script lê links de convite de grupos de uma pasta, tenta entrar nos grupos,
 * extrai os participantes e salva em arquivos. Também mantém controle de grupos já processados,
 * links expirados e grupos aguardando aceite.
 * 
 * Principais funcionalidades:
 * - Lê links de grupos de arquivos em uma pasta específica.
 * - Verifica se o grupo já foi processado (participantes extraídos).
 * - Tenta entrar no grupo via link de convite.
 * - Se conseguir, extrai e salva os participantes.
 * - Se não conseguir, salva o grupo como aguardando aceite ou link expirado.
 * - Mantém arquivos de controle para evitar processamento duplicado.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const { extractInviteCode, getAllLinesOfAllFilesOfOneFolder,
	joinGroupByInvite
 } = require('../lib/WhatSApp.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const palavra = 'anime'
const waitAcceptPath = path.resolve(__dirname, 'groupsWpp', palavra, 'groupSWaitAccept.db');

/**
 * Carrega participantes antigos de um arquivo.
 * @param {string} filePath - Caminho do arquivo de participantes.
 * @returns {Object} Objeto com IDs dos participantes e suas informações.
 */
function loadOldParticipants(filePath) {
	let oldParticipants = {};
	if (fs.existsSync(filePath)) {
		const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
		for (const line of lines) {
			const [id, date, status] = line.split('\t');
			oldParticipants[id] = { date, status };
		}
	}
	return oldParticipants;
}

/**
 * Atualiza ou insere participantes atuais no objeto de participantes.
 * @param {Object} oldParticipants - Participantes antigos.
 * @param {Array} currentIds - IDs atuais dos participantes.
 * @param {string} now - Data/hora atual.
 */
function updateCurrentParticipants(oldParticipants, currentIds, now) {
	for (const id of currentIds) {
		oldParticipants[id] = { date: now }; // Atualiza data/hora
	}
}

/**
 * Marca como "saiu" quem não está mais no grupo.
 * @param {Object} oldParticipants - Participantes antigos.
 * @param {Array} currentIds - IDs atuais dos participantes.
 * @param {string} now - Data/hora atual.
 */
function markLeftParticipants(oldParticipants, currentIds, now) {
	for (const id in oldParticipants) {
		if (!currentIds.includes(id)) {
			if (!oldParticipants[id].status) {
				oldParticipants[id] = { date: now, status: 'saiu' };
			}
		}
	}
}

/**
 * Salva participantes no arquivo no formato pedido.
 * @param {string} filePath - Caminho do arquivo.
 * @param {Object} oldParticipants - Participantes a serem salvos.
 */
function saveParticipants(filePath, oldParticipants) {
	const participantsList = Object.entries(oldParticipants)
		.map(([id, obj]) => obj.status ? `${id}\t${obj.date}\t${obj.status}` : `${id}\t${obj.date}`)
		.join('\n');
	fs.writeFileSync(filePath, participantsList + (participantsList ? '\n' : ''), 'utf8');
	console.log(`Participantes salvos em: ${filePath}`);
}

/**
 * Remove o grupo do arquivo de espera (aguardando aceite).
 * Caso o grupo já tenha sido processado (participantes extraídos)
 * Remove o ID do grupo do arquivo de espera.
 * @param {string} chatIdSerialized - ID serializado do grupo.
 */
function removeGroupFromWaitAccept(chatIdSerialized) {
	if (fs.existsSync(waitAcceptPath)) {
		const lines = fs.readFileSync(waitAcceptPath, 'utf8').split('\n');
		const filtered = lines.filter(line => line.trim() !== chatIdSerialized && line.trim() !== '');
		fs.writeFileSync(waitAcceptPath, filtered.join('\n') + (filtered.length ? '\n' : ''), 'utf8');
	}
}

// Initialize the client
const client = new Client({
	authStrategy: new LocalAuth(),
	puppeteer: { headless: true }
});

/**
 * Evento de geração do QR Code para autenticação do WhatsApp Web.
 */
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

/**
 * Salva o link expirado em um arquivo.
 * @param {string} file - Caminho do arquivo.
 * @param {string} link - Link do grupo.
 */
function saveExpiredLink(file, link) {
	const now = new Date().toISOString().slice(0,19) + 'Z';
	fs.appendFileSync(file, `${link}\t${now}\n`, 'utf8');
	console.log(`ID/link expirado salvo em: ${file}`);
}

/**
 * Salva o grupo aguardando aceite em um arquivo, incluindo o invite code e a data/hora UTC.
 * @param {string} chatIdSerialized - ID serializado do grupo.
 * @param {string} inviteCode - Código do convite do grupo.
 */
function saveGroupWaitAccept(chatIdSerialized, inviteCode) {
	const now = new Date().toISOString().slice(0,19) + 'Z';
	fs.appendFileSync(waitAcceptPath, `${chatIdSerialized}\t${inviteCode}\t${now}\n`, 'utf8');
	console.log(`Grupo aguardando aceite salvo em: ${waitAcceptPath}`);
}

/**
 * Salva o inviteCode e groupId no arquivo groupsEntered.db.
 * @param {string} inviteCode - Código do convite do grupo.
 * @param {string} groupId - ID do grupo.
 */
function saveGroupEntered(inviteCode, groupId) {
	const now = new Date().toISOString().slice(0,19) + 'Z';
	const filePath = path.resolve(__dirname, 'groupsWpp', palavra, 'groupsEntered.db');
	fs.appendFileSync(filePath, `${inviteCode}\t${groupId}\t${now}\n`, 'utf8');
	console.log(`Grupo salvo em groupsEntered.db: ${inviteCode} - ${groupId}`);
}

/**
 * Tenta entrar no grupo via link de convite.
 * @param {string} inviteCode - Código do convite.
 * @param {Client} client - Instância do cliente WhatsApp.
 * @returns {Promise<string|null>} ID do grupo ou null.
 */
function getChatIdFromInvite(inviteCode, client) {
	return joinGroupByInvite(inviteCode, client)
		.then(chat_id => chat_id)
		.catch(() => null);
}

/**
 * Obtém o chat_id via getInviteInfo do WhatsApp Web.
 * @param {string} inviteCode - Código do convite.
 * @param {Client} client - Instância do cliente WhatsApp.
 * @returns {Promise<string|null>} ID do grupo ou null.
 */
async function getChatIdFromInviteInfo(inviteCode, client) {
	try {
		const info = await client.getInviteInfo(inviteCode);
		if (info && info.id) {
			const chat_id = info.id._serialized || info.id;
			console.log('Obtido chat_id via getInviteInfo:', chat_id);
			return chat_id;
		}
	} catch (e) {
		console.log('Não foi possível obter chat_id via getInviteInfo:', e.message);
	}
	return null;
}

/**
 * Tenta obter o chat_id do grupo, primeiro tentando entrar, depois consultando o invite.
 * @param {string} inviteCode - Código do convite.
 * @param {Client} client - Instância do cliente WhatsApp.
 * @returns {Promise<string|null>} ID do grupo ou null.
 */
async function tryGetChatId(inviteCode, client) {
	let chat_id = await getChatIdFromInvite(inviteCode, client);
	if (!chat_id) {
		chat_id = await getChatIdFromInviteInfo(inviteCode, client);
	}
	return chat_id;
}

/**
 * Processa o grupo quando já está dentro dele: salva participantes e remove do arquivo de espera.
 * @param {Object} chat - Objeto do grupo.
 * @param {string} inviteCode - Código do convite.
 * @param {string} palavra - Palavra-chave da pasta.
 */
function handleInGroup(chat, inviteCode, palavra) {
	const numbersDir = path.resolve(__dirname, '../numbersWpp', palavra);
	if (!fs.existsSync(numbersDir)) fs.mkdirSync(numbersDir, { recursive: true });
	const filePath = path.join(
		numbersDir,
		`${chat.id.user || chat.id._serialized}_${inviteCode}.db`
	);
	const now = new Date().toISOString().slice(0,19) + 'Z';
	let oldParticipants = loadOldParticipants(filePath);
	const currentIds = chat.participants.map(p => p.id._serialized);
	updateCurrentParticipants(oldParticipants, currentIds, now);
	markLeftParticipants(oldParticipants, currentIds, now);
	saveParticipants(filePath, oldParticipants);
	saveGroupEntered(inviteCode, chat.id._serialized);
	removeGroupFromWaitAccept(chat.id._serialized);
}

/**
 * Processa o grupo quando NÃO está dentro dele: salva no arquivo de aguardando aceite.
 * @param {Object} chat - Objeto do grupo.
 * @param {string} inviteCode - Código do convite do grupo.
 */
function handleNotInGroup(chat, inviteCode) {
	saveGroupWaitAccept(chat.id._serialized, inviteCode);
}

/**
 * Processa um link de grupo: tenta entrar, extrai participantes ou salva como aguardando/expirado.
 * @param {string} link - Link do grupo.
 * @param {Client} client - Instância do cliente WhatsApp.
 * @param {string} palavra - Palavra-chave da pasta.
 */
async function processGroupLink(inviteCode, client, palavra, group_Id) {
	console.log('Invite code:', inviteCode);

	if (!group_Id) {
		saveExpiredLink(path.resolve(__dirname, 'groupsWpp', palavra, 'linkExpired2.db'), link);
		return;
	}

	console.log('Group ID:', group_Id);
	const handleError = () => {
		console.log('Erro ao buscar chat ou verificar participação.');
		saveExpiredLink(path.resolve(__dirname, 'groupsWpp', palavra, 'linkExpired1.db'), link);
	};

	try {
		const chat = await client.getChatById(group_Id);
		if (!chat || !chat.isGroup) return handleError();

		const myNumber = client.info.wid._serialized;
		const inGroup = chat.participants.some(p => p.id._serialized === myNumber);

		console.log(inGroup ? 'Você está no grupo:' : 'Você NÃO está no grupo:', group_Id);
		inGroup ? handleInGroup(chat, inviteCode, palavra) : handleNotInGroup(chat, palavra, inviteCode);
	} catch (e) {
		handleError();
	}
}

/**
 * Verifica se a data do registro está há mais de 24h da data atual.
 * @param {string} dateStr - Data no formato YYYY-MM-DDTHH:mm:ssZ
 * @returns {boolean}
 */
function isMoreThan24h(dateStr) {
	const then = new Date(dateStr);
	const now = new Date();
	return (now - then) > (24 * 60 * 60 * 1000);
}

/**
 * Obtém os inviteCodes já processados em numbersWpp/palavra.
 * Ou seja, os inviteCodes que são parte do link do grupo e já tiveram os números extraídos.
 * @param {string} numbersDir - Caminho da pasta numbersWpp/palavra.
 * @returns {Set<string>} Set de inviteCodes já processados.
 */
function getProcessedInviteCodes(numbersDir) {
	const processed = new Set();
	if (!fs.existsSync(numbersDir)) return processed;
	const files = fs.readdirSync(numbersDir);
	for (const file of files) {
		// Esperado: nome = <chat_id>_<inviteCode>.db
		const match = file.match(/_(\w+)\.db$/);
		if (match) {
			const filePath = path.join(numbersDir, file);
			const isEmpty = fs.statSync(filePath).size === 0;
			if (!isEmpty) {
				processed.add(match[1]);
			}
		}
	}
	return processed;
}

/**
 * Evento principal: ao ficar pronto, processa todos os links de grupos novos.
 */
client.on('ready', async () => {
    console.log('Client is ready!');
    const groupLinksDir = path.resolve(__dirname, '../groupsWpp', palavra);
    let groupS_Link = getAllLinesOfAllFilesOfOneFolder(groupLinksDir);

	const groupS_Ids = [];
	const invite_CodeS = [];
	const dbPath = path.join(__dirname, '..', 'groupsWpp', palavra, 'inviteCodeAndGroupId.db');

	// Lê registros existentes do arquivo para mapear inviteCode -> data
	let inviteCodeDateMap = {};
	if (fs.existsSync(dbPath)) {
		const lines = fs.readFileSync(dbPath, 'utf8').split('\n').filter(Boolean);
		for (const line of lines) {
			const [inviteCode, groupId, dateStr] = line.split('\t');
			if (inviteCode && dateStr) inviteCodeDateMap[inviteCode] = dateStr;
		}
	}

	// Obtém os inviteCodes já processados
	const numbersDir = path.resolve(__dirname, '../numbersWpp', palavra);
	const processedInviteCodes = getProcessedInviteCodes(numbersDir);

	// Filtra e popula arrays sincronamente
	for (const link of groupS_Link) {
		const inviteCode = extractInviteCode(link);
		if (inviteCode && processedInviteCodes.has(inviteCode)) {
			continue;
		}
		const group_Id = await tryGetChatId(inviteCode, client);
		// Salva no arquivo se não existir ou atualiza se necessário
		if (!group_Id) {
			console.log(`Não foi possível obter o ID do grupo para o link: ${link}`);
			saveExpiredLink(path.resolve(__dirname, 'groupsWpp', palavra, 'linkExpired3.db'), link);
			continue;
		}
		if (!inviteCodeDateMap[inviteCode]) {
			/////////////////////////codigo errado, provavelmente esta gerando duplicatas
			const now = new Date().toISOString().slice(0,19) + 'Z';
			fs.appendFileSync(dbPath, `${inviteCode}\t${group_Id}\t${now}\n`);
			// inviteCodeDateMap[inviteCode] = now;
			console.log(`Grupo ${group_Id} adicionado ao arquivo de grupos.`);
		}
		if (inviteCode && !processedInviteCodes.has(inviteCode)) {
			invite_CodeS.push(inviteCode);
			groupS_Ids.push(group_Id);
		} else if (processedInviteCodes.has(inviteCode)) {
			console.log(`Grupo ${group_Id} já processado.`);
			const dateStr = inviteCodeDateMap[inviteCode];
			if (dateStr && isMoreThan24h(dateStr)) {
				try {
					const chat = await client.getChatById(group_Id);
					// Verifica se é realmente um grupo
					if (chat.isGroup) {
						await chat.leave();
						console.log(`Saiu do grupo: ${group_Id}`);
					} else {
						console.log(`O ID ${group_Id} não corresponde a um grupo.`);
					}
				} catch (err) {
					console.error(`Erro ao sair do grupo ${group_Id}.`);
				}
			}
		}
	}

	if (!invite_CodeS || invite_CodeS.length === 0) {
		console.log('Nenhum link novo encontrado na pasta:', groupLinksDir);
		return;
	}

    for (let i = 0; i < invite_CodeS.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000));
		const inviteCode = invite_CodeS[i];
		const group_Id = groupS_Ids[i];
		await processGroupLink(inviteCode, client, palavra, group_Id);
    }
	console.log('END!')
});

/**
 * Evento de atualização de grupo (não utilizado).
 */
client.on('group_update', (notification) => {
	// console.log('Group update:', notification);
});

/**
 * Evento de entrada em grupo (não utilizado).
 */
client.on('group_join', () => {
    // Print the group ID in serialized format
    const groupId = group.id ? group.id : group; // adapt if your event gives a different structure
    console.log('Group ID:', JSON.stringify(groupId));

    // Path to the inviteCodeAndGroupId.db file
    const dbPath = path.join(__dirname, 'groupsWpp', 'anime', 'inviteCodeAndGroupId.db');
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        const lines = data.split('\n');
        const found = lines.find(line => line.includes(groupId));
        if (found) {
            const inviteCode = found.split('\t')[0];
            console.log('Invite Code:', inviteCode);
        } else {
            console.log('Invite code not found for this group.');
        }
    } catch (err) {
        console.error('Error reading DB file:', err);
    }
});

client.initialize();
