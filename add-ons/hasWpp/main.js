const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal')
const { validNumberSBiz, validNumberSPhoneS,
	tests, valid_NumberS_Phone_3
 } = require('../lib/validNumberS.js');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

client.on('qr', (qr) => {
	qrcode.generate(qr, {small: true});
});

client.on('ready', async () => {
  console.log('Cliente pronto!');
  let testS_True = await tests(client);
  if (!testS_True) {
	console.log('Testes falharam, encerrando cliente.');
	client.destroy();
	return;
  }
  await valid_NumberS_Phone_3(client);
});

client.initialize();
