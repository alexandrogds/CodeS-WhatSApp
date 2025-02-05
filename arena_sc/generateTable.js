const { readFile } = require('./myfs.js')
const getMapNickSUnicode = require('./arena_sc/getMapNickSUnicode.js')

async function generateTable(winnerS) { // Make the function async
	let reply = ''
	console.log('init =', typeof reply)
	
    const pathTitle = String.raw`C:\Users\user\OneDrive\RPG's\Chapéus De Palha _ Alex Thierry\molde de contagem de lutas na arena sc - title.md`
    let title = await readFile(pathTitle); // Use await since readFile is async
    console.log('title\n', title)

    const pathDivisor = String.raw`C:\Users\user\OneDrive\RPG's\Chapéus De Palha _ Alex Thierry\molde de contagem de lutas na arena sc - divisor.md`
    let divider = await readFile(pathDivisor); // Use await since readFile is async
    console.log('divider\n', divider)

	const pathContent = String.raw`C:\Users\user\OneDrive\RPG's\Chapéus De Palha _ Alex Thierry\molde de contagem de lutas na arena sc - content.md`
    let content = await readFile(pathContent); // Use await since readFile is async
	console.log('content\n', content)

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
	console.log('head =', typeof reply)

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
		console.log('add winner =', typeof reply)
	}

	console.log('end =', typeof reply)
	return reply;
}

// Example usage:
// async function main(){

//     const finalContent = await generateTable();

//     if (finalContent){ //Check if the function returned correctly.
//         console.log(finalContent);
//         //Now save to file or send a message
//     }
// }

// main()

module.exports = generateTable
