const dotenv = require('dotenv')
const { appendFile } = require('./myfs')

dotenv.config({ path: './.env' });

// error.js
function error(message, code, info) {
	const time = new Date().toLocaleTimeString()
	const data = new Date().toLocaleDateString()
	const dt = data + ' ' + time
	
	let out = dt + '; ' + message.split(/\r\n|\n|\r/).join("/n"); + '; code=' + code + '; info=' + info
	console.error(out)
	let file_path = process.env.FILE_WITH_LOGS_DA_ARENA_SC
	appendFile(file_path, out)
}

module.exports = error
