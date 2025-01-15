const { readFile } = require('./fs2.js')
const getMapNickSUnicode = require('./getMapNickSUnicode.js')

async function generateTable(winnersAndTheirFights) { // Make the function async
	let reply = ''

    const pathTitle = "C:\\Users\\user\\OneDrive\\RPGs\\Chapéus De Palha - Alex Thierry\\molde de contagem de lutas na arena sc - title.md";
    let title = await readFile(pathTitle); // Use await since readFile is async
    console.log('content =', title)

    const pathDivisor = "C:\\Users\\user\\OneDrive\\RPGs\\Chapéus De Palha - Alex Thierry\\molde de contagem de lutas na arena sc - divisor.md";
    let divider = await readFile(pathDivisor); // Use await since readFile is async
    console.log('content =', divider)

	const pathContent = "C:\\Users\\user\\OneDrive\\RPGs\\Chapéus De Palha - Alex Thierry\\molde de contagem de lutas na arena sc - content.md";
    let content = await readFile(pathContent); // Use await since readFile is async
	console.log('content =', content)

	let nickSUniCode = getMapNickSUnicode()

	if (content === null || title === null || divider === null || nickSUniCode == []) {
        //Do something
        console.log("ERRO147: conteúdos não encontrado")
        return
    }
    
	if (!winnersAndTheirFights || winnersAndTheirFights.length === 0) {
		console.error("No winners and fights data provided.");
		return // Return original content or handle as needed
	}

	reply += title + '\n' + divider

	//Map winnersAndTheirFights to an object with { nick: winners }
	const mappedWinners = {};

	winnersAndTheirFights.forEach(({ nick, winners }) => {

		mappedWinners[mapearNickSUnicode[nick]] = winners
	});

	let aux = content
	let aux2 = ''
	// Example replacements – replace with your dynamic data
	for (const nick in mappedWinners){
		const winners = mappedWinners[nick];
		aux2 = aux.replace(new RegExp(`{{${'Nick'}}}`, ''), nick); // Use RegExp for dynamic replacement
		aux2 = aux2.replace(new RegExp(`{{${'00'}}}`, ''), winners); // Use RegExp for dynamic replacement
		reply += '\n' + aux2 + '\n' + divider
	}

	return content;
}

// Example usage:
async function main(){

    const finalContent = await generateTable();

    if (finalContent){ //Check if the function returned correctly.
        console.log(finalContent);
        //Now save to file or send a message
    }
}

main()

module.exports = generateTable
