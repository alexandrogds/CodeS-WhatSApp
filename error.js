const myfs = require('./myfs')

// error.js
function error(message, code, info) {
	const timestamp = new Date().toLocaleTimeString()
	const data = new Date().toLocaleDateString()
	const dt = data + ' ' + timestamp
	let out = dt + '_' + message.replace('/\n/g', '/n') + 'code=' + code + 'info=' + info
	myfs.appendFile(String.raw`C:\Users\user\OneDrive\RPG's\Chapéus De Palha _ Alex Thierry\bot.log`, out)
}

module.exports = error;
