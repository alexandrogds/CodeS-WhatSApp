// Script para recrutar contatos via WhatsApp usando whatsapp-web.js
// Recruta apenas números com DDI 55 (Brasil)
// Salva os números que receberam mensagem para evitar duplicidade

const { Client, LocalAuth } = require('whatsapp-web.js'); // Importa o cliente WhatsApp e autenticação local
const qrcode = require('qrcode-terminal') // Gera QRCode para autenticação
const fs = require('fs'); // Manipulação de arquivos
const path = require('path'); // Manipulação de caminhos
const { get_Message_Recruit } = require('../../lib/openai.js'); // Função para obter mensagem de recrutamento

palavra = 'anime'; // Palavra-chave para selecionar a pasta de números (ajuste conforme necessário)

const client = new Client({
  authStrategy: new LocalAuth(), // Usa autenticação local
  puppeteer: { headless: true } // Executa o navegador em modo headless
});

// Evento disparado ao gerar QRCode para login
client.on('qr', (qr) => {
	qrcode.generate(qr, {small: true});
});

// Evento disparado quando o cliente está pronto
client.on('ready', async () => {
  console.log('Cliente pronto!');

  // Caminho da pasta dos arquivos de números
  const dirPath = path.join(__dirname, `../../numbersWpp/${palavra}`);
  let numbersToSend = new Set(); // Conjunto para armazenar números únicos

  // Listar todos os arquivos na pasta de números
  fs.readdirSync(dirPath).forEach(file => {
    const filePath = path.join(dirPath, file);
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    lines.forEach(line => {
      const [number] = line.split('\t'); // Considera apenas o número antes do tab
      if (number && number.startsWith('55')) { // Filtra apenas DDI 55
        numbersToSend.add(number.trim());
      }
    });
  });

  // Caminho do arquivo que armazena números já contactados
  const contactedPath = path.join(__dirname, 'numberS_Contacted.db');
  let contactedSet = new Set(); // Conjunto de números já contactados
  if (fs.existsSync(contactedPath)) {
    const contactedLines = fs.readFileSync(contactedPath, 'utf-8').split('\n');
    contactedLines.forEach(line => {
      if (line.trim()) contactedSet.add(line.trim());
    });
  }

  // numbersToSend = ['559581042843@c.us'] // Exemplo de teste
  let quant = 0;
  for (const number of numbersToSend) {
	quant++;
	if (quant > 10) break; // Limita a 10 envios por execução
    // Envia apenas para números que começam com 55
    if (!number.startsWith('55')) continue;
    const chatId = `${number}`;
    if (contactedSet.has(chatId)) {
	  quant--
      console.log(`Já contactado: ${chatId}.`);
      continue;
    } else {
      quant++
	}
    try {
      // Salva o chatId antes de enviar a mensagem para evitar duplicidade
      fs.appendFileSync(contactedPath, chatId + '\n');
      const aiMessage = await get_Message_Recruit(); // Obtém mensagem personalizada
      // Salva a mensagem enviada
      fs.appendFileSync(path.join(__dirname, 'messageS_SendED.db'), aiMessage + '\n');
      await client.sendMessage(chatId, aiMessage); // Envia mensagem via WhatsApp
      console.log(`Mensagem enviada para: ${number}.`);
    } catch (err) {
      console.log(`Erro ao enviar para ${number}:\n`, err.message,'.');
    }
  }
});

// Inicializa o cliente WhatsApp
client.initialize();
