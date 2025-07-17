
function strip(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}

function exists(obj) {
	if (obj) {
		return True
	}
	return False
}

module.exports = { strip, exists }
