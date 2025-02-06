
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

module.exports = { zip }