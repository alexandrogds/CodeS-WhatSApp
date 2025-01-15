const getNickSUniCode = require('./getNickSUniCode.js')
const getNickS = require('./getNickS.js')

async function mapearNickSUnicode() {
    let nickSUniCode = await getNickSUniCode();
    let nickS = await getNickS();

    const nickMap = {};

    nickS.forEach(nick => {
        const nickUnicodeMatch = nickSUniCode.find(nickUnicode => {
            const decodedNickUnicode = decodeURIComponent(escape(nickUnicode));
            return decodedNickUnicode.includes(nick); // verifica se o nickUnicode cont�m o nick
        });

        if (nickUnicodeMatch) {

            nickMap[nick] = nickUnicodeMatch;
        }
    });

    console.log("Mapeamento de Nicks:", nickMap);
    return nickMap;
}

module.exports = mapearNickSUnicode
