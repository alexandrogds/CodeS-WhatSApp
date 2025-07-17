

function determinar_vencedor_com_life_diferentes(resultados) {
    if (resultados[0][1][0] === 0) {
        return resultados[1][0]
    } else if (resultados[1][1][0] === 0) {
        return resultados[0][0]
    }
    return null
}

module.exports = { determinar_vencedor_com_life_diferentes }
