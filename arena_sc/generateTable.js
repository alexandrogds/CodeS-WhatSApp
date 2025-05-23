

const dotenv = require('dotenv')
const { readFile } = require('../myfs.js')
const { getMapNickSUnicode } = require('./getMapNickSUnicode.js')

dotenv.config({ path: '../.env' });

async function generateTable(winnerS) { // Make the function async
	let reply = ''
	
    const pathTitle = process.env.FILE_WITH_TITLE_MOLDE_DA_CONTAGEM_PARCIAL_DE_LUTAS_DA_ARENA_SC
    let title = await readFile(pathTitle); // Use await since readFile is async
    // console.log('title\n', title)

    const pathDivisor = process.env.FILE_WITH_DIVIDER_DO_MOLDE_DA_CONTAGEM_PARCIAL_DE_LUTAS_DA_ARENA_SC
    let divider = await readFile(pathDivisor); // Use await since readFile is async
    // console.log('divider\n', divider)

	const pathContent = process.env.FILE_WITH_CONTENT_DO_MOLDE_DA_CONTAGEM_PARCIAL_DE_LUTAS_DA_ARENA_SC
    let content = await readFile(pathContent); // Use await since readFile is async
	// console.log('content\n', content)

	let nickSUniCode = await getMapNickSUnicode()

	if (content === null || title === null || divider === null || nickSUniCode == []) {
        //Do something
        console.log("ERRO147: conteúdos não encontrado")
        return
    }
    
	if (!winnerS || winnerS.length === 0) {
		console.error("No winners and fights data provided.");
		return // Return original content or handle as needed
	}

	reply += title + '\n' + divider

	//Map winnerS to an object with { nick: winners }
	const mappedWinners = {};

	console.log(winnerS)
	Object.keys(winnerS).forEach(nick => { mappedWinners[nick.toLowerCase()] = {'wins': winnerS[nick.toLowerCase()], 'nickUnicode': nickSUniCode[nick.toLowerCase()] }});

	let aux = content
	let aux2 = ''
	// Example replacements – replace with your dynamic data
	for (const nick in mappedWinners){
		aux2 = aux.replace('Nick', mappedWinners[nick]['nickUnicode']); // Use RegExp for dynamic replacement
		aux2 = aux2.replace('00', mappedWinners[nick]['wins']); // Use RegExp for dynamic replacement
		reply += '\n' + aux2 + '\n' + divider
	}

	return reply;
}

module.exports = { generateTable }
