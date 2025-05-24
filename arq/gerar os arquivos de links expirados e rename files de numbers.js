// que cuja criação não estavam no codigo inicial
const { Client, LocalAuth } = require('whatsapp-web.js');
const { extractInviteCode, getAllLinesOfAllFilesOfOneFolder } = require('../lib/WhatSApp.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

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
	const groupLinksDir = path.resolve(__dirname, '../groupsWpp', 'anime');
	let groupLinks = getAllLinesOfAllFilesOfOneFolder(groupLinksDir);
	if (!groupLinks || groupLinks.length === 0) {
		console.log('Nenhum link encontrado na pasta:', groupLinksDir);
		return;
	}
	// Adiciona todos os invite codes a um array
	const inviteCodes = groupLinks.map(link => extractInviteCode(link));
	const numbersDir = path.resolve(__dirname, '../numbersWpp', 'anime');
	const files = fs.existsSync(numbersDir) ? fs.readdirSync(numbersDir) : [];
	// Lê o arquivo groupsWaitAccept e coloca em array com trim
	const groupsWaitAcceptPath = path.resolve(__dirname, '../enterGroups/groupSWaitAccept.db');
	let groupsWaitAcceptLines = [];
	try {
		const data = fs.readFileSync(groupsWaitAcceptPath, 'utf-8');
		groupsWaitAcceptLines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
		console.log('Linhas do groupsWaitAccept:', groupsWaitAcceptLines);
	} catch (err) {
		// Se não existir, ignora
		// console.error('Erro ao ler groupsWaitAccept:', err);
	}

	for (let i = 0; i < groupLinks.length; i++) {
		// Aguarda 5 segundos antes de cada iteração
		await new Promise(resolve => setTimeout(resolve, 5000));
		const inviteCode = inviteCodes[i];
		console.log('Invite code:', inviteCode);

		// Garante que o arquivo renomeado tenha o id no filename
		let idInFilename = null;
		// Tenta extrair o id do nome do arquivo, se possível
		if (i < files.length) {
			const oldFile = files[i];
			const oldPath = path.join(numbersDir, oldFile);
			const ext = path.extname(oldFile);
			const baseName = path.basename(oldFile, ext);
			// Se já tem id, mantém, senão adiciona inviteCode
			if (baseName.includes('_')) {
				idInFilename = baseName.split('_')[0];
			} else {
				idInFilename = baseName;
			}
			let newFile;
			if (!oldFile.includes(idInFilename)) {
				newFile = `${idInFilename}_${inviteCode}.db`;
			} else if (!oldFile.includes(inviteCode)) {
				newFile = `${baseName}_${inviteCode}.db`;
			} else {
				newFile = oldFile;
			}
			const newPath = path.join(numbersDir, newFile);

			try {
				if (oldFile !== newFile) {
					fs.renameSync(oldPath, newPath);
					console.log(`Renamed: ${oldFile} -> ${newFile}`);
				}
			} catch (err) {
				console.error(`Error renaming ${oldFile}:`, err);
			}
		}

		// Se não houver arquivo com o id, verifica se o id está em groupsWaitAcceptLines
		let fileWithIdExists = files.some(f => idInFilename && f.includes(idInFilename));
		if (!fileWithIdExists && idInFilename) {
			const idInWaitAccept = groupsWaitAcceptLines.includes(idInFilename);
			if (!idInWaitAccept) {
				// Salva inviteCode + id serializado + data/hora UTC no arquivo linkExpired.db
				const expiredPath = path.resolve(__dirname, 'linkExpired.db');
				const now = new Date().toISOString().slice(0,19) + 'Z'; // YYYY-MM-DDTHH:mm:ssZ
				fs.appendFileSync(expiredPath, `${inviteCode}\t${idInFilename}\t${now}\n`, 'utf8');
				console.log(`Invite code e id serializado expirados salvos em: ${expiredPath}`);
			}
		}
	}
});

client.initialize();