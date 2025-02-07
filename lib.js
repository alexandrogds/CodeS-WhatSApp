
function zip(arr1, arr2) {
    // caso parametro seja string passar como str.split("") // get char separado
    // função semelhante ao zip python (https://docs.python.org/3/library/functions.html#zip)
    const result = [];
    const minLength = Math.min(arr1.length, arr2.length); // Handle different lengths
  
    for (let i = 0; i < minLength; i++) {
      result.push([arr1[i], arr2[i]]);
    }
    return result;
}

function removeFirst9After55(str) {
  // transformar os números para terem 8 digitos (BR) retirando o nono digio
  // para que a menção funcione
  if (str.startsWith("55") && str.length === 13) {
    const index = str.indexOf("9", 3); // Start searching from the third character (index 2)
    if (index !== -1) {
      return str.substring(0, index) + str.substring(index + 1);
    }
  }
  return str;
}

function strip(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}

module.exports = { zip, removeFirst9After55, strip }
