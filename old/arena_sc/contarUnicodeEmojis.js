

function contarUnicodeEmojis(str) {
	if (!str) {
		return 0; // Handle null or undefined input
	}
	const emojiRegex = /\p{Emoji_Presentation}/gu; // Unicode property escape for emojis
	const matches = str.match(emojiRegex) || []; // Find all emoji matches
	return matches.length;
}

module.exports = { contarUnicodeEmojis }
