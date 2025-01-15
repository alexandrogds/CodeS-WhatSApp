// error.js
function error(msg, numbers, dataHoraUser, code, info = '') {
	const timestamp = dataHoraUser ? dataHoraUser.data_hora : 'Unknown Timestamp'; // Handle potential null value
	const user = dataHoraUser ? dataHoraUser.usuario : 'Unknown User';
	console.error(`Error ${code}:`, msg, numbers, timestamp, user, info);
	// ... rest of error handling logic ...
}

module.exports = error;
