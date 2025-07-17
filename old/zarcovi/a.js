function isAlpha(char) {
 /**
  * Checks if a character is an alphabetic character (a-z, A-Z).
  *
  * Args:
  *   char: The character to check.
  *
  * Returns:
  *   True if the character is alphabetic, False otherwise.
  */
 if (typeof char !== 'string' || char.length !== 1) {
   return false; // Handle cases where char is not a single character string
 }
 const charCode = char.charCodeAt(0);
 return (charCode >= 97 && charCode <= 122) || (charCode >= 65 && charCode <= 90);
}

function getRyos(line) {
 let space = false;
 let number = '';
 for (const char of line) {
   if (['.', '@', '*'].includes(char) && !space) {
     continue;
   } else if (char === '+') {
     continue;
   } else if (char === '@' && space) {
     space = false;
   } else if ([' ', ':'].includes(char)) {
     space = true;
     if (number.length !== 0) {
       return number;
     }
   } else if (['b', 'B'].includes(char) && space) {
     return number;
   } else if (isAlpha(char)) {
     space = false;
   } else if (space && !isNaN(parseInt(char)) && char !== ' ') { // Check for digit and not space
     number += char;
   }
 }
 return number;
}

function getNumber(line) {
 let nomDigit = false;
 let number = '';
 let spaces = 0;
 for (const char of line) {
   if (['.', '@', '*'].includes(char)) {
     continue;
   } else if (isAlpha(char)) {
     nomDigit = true;
     return line.split(' ').slice(0, 2).join('');
   } else if (char === ' ') {
     spaces += 1;
     if (spaces > 1 || number.length > 7) {
       return number;
     }
   } else if (!isNaN(parseInt(char)) && char !== ' ') { // Check for digit and not space
     number += char;
   }
 }
 return number;
}

function getAccount(line) {
 /**
  * codigo antigo
  * match = re.search(r"[.@*\s]*(\d)", line)
  * if match:
  *   _ = match.group(1).strip()[-4:]
  *   return _
  */
 const num = getNumber(line);
 return num.slice(-4);
}

function extractPaysLine(message) {
 /**
  * split no '\n'; strip em todas as linhas;
  * pegar a linha que começa com '@'
  * pegar o conteudo desde o inicio dessa linha
  * ate que apareça '+' ou um número de ate dois digitos
  * seguido por 'B' ou 'b'.
  */
 const lines = message.split('\n');
 const pays = [];
 for (const line of lines) {
   const trimmedLine = line.trim();
   if (trimmedLine.includes('@')) {
     if (trimmedLine.startsWith('@') || trimmedLine.startsWith('.') || trimmedLine.startsWith('*')) {
       pays.push(trimmedLine);
     }
   }
 }
 return pays.length === 0 ? null : pays;
}

// Example of how to use it with Node.js file system and assuming 'mensagem_atual' and 'output_path' are defined
const fs = require('fs');

// Assuming mensagem_atual is defined somewhere, for example:
// let mensagem_atual = "...your message string...";
// let output_path = "...your output file path...";

async function processMessage(mensagem_atual, output_path) {
 let pays = [];
 // Assuming line_index is defined in the outer scope of original python code, setting it to 0 for example.
 let line_index = 0;

 if (mensagem_atual && (mensagem_atual.split('\n').length < 3 || (()=>{
   const regexResult = mensagem_atual.match(/[.@*]?(@.*?) (\+?\d{1,2}[bB]?)/);
   return regexResult ? (regexResult[1].trim() === '') : true;
 })())) {
   mensagem_atual = '';
   return; // In a loop context, this would continue to the next iteration
 }

 const extractedPays = extractPaysLine(mensagem_atual);
 if (extractedPays !== null) {
   for (const c of extractedPays) {
     pays.push(c + ' Dg' + getAccount(c) + ` ${line_index}`); // Assuming line_index is available
   }
 }

 const aux = new Set();
 for (const lineA of pays) {
   const a = getAccount(lineA);
   let ryos = 0;
   for (const lineB of pays) {
     const b = getAccount(lineB);
     if (a === b) {
       try {
         const ryosValue = getRyos(lineB);
         if (!isNaN(parseInt(ryosValue))) {
           ryos += parseInt(ryosValue);
           if (parseInt(ryosValue) > 150) {
             getRyos(lineB); // Python code calls it again, might be for debugging or side effect? Keeping it in translation.
           }
         } else if (lineB.split(' ').pop() !== '689') { // lineB.split(' ') will return array, and pop() gets last element
           getRyos(lineB); // Python code calls it again, might be for debugging or side effect? Keeping it in translation.
         }
       } catch (error) {
         console.log(lineB);
         console.log(getRyos(lineB));
         process.exit(1); // Equivalent to exit() in Python
       }
     }
   }
   const _num = getNumber(lineA);
   aux.add(`@${_num} ${ryos} Dg${a}`);
 }
 pays = Array.from(aux); // Convert Set to Array for easier iteration later

 try {
   let fileContent = '';
   for (const pay of pays) {
     fileContent += pay + '\n';
   }
   await fs.promises.writeFile(output_path, fileContent, 'utf-8');
   console.log(`Successfully wrote to ${output_path}`);
 } catch (err) {
   console.error(`Error writing to file ${output_path}:`, err);
 }
}

// Example usage (you need to define mensagem_atual and output_path before calling this):
// const mensagem_atual = `@...your message...\n...`;
// const output_path = 'output.txt';
// processMessage(mensagem_atual, output_path);


// To run this code, you would need to have Node.js installed,
// save this code as a .js file (e.g., convert.js), and then run it from your terminal:
// node convert.js