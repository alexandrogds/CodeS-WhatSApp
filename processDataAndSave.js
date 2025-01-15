const fs = require('fs/promises');

async function processDataAndSave(output_path, juiz_output_path) {  // Make the function async
	const aux = {};
	const semanas_e_seus_nicks_com_maior_vitoria = {};

	for (const k in datas_nicks_e_suas_quantidade_de_vitorias) {
		const nicks_com_mais_vitorias_na_semana = [];
		let maior_quantidade_de_vitorias_na_semana = -1;
		aux[k] = {};

		for (const nick of nicks) { // Assuming 'nicks' is defined
			if (datas_nicks_e_suas_quantidade_de_vitorias[k][nick] !== 0) {
				aux[k][nick] = datas_nicks_e_suas_quantidade_de_vitorias[k][nick];
			}
			if (datas_nicks_e_suas_quantidade_de_vitorias[k][nick] > maior_quantidade_de_vitorias_na_semana) {
				maior_quantidade_de_vitorias_na_semana = datas_nicks_e_suas_quantidade_de_vitorias[k][nick];
				nicks_com_mais_vitorias_na_semana.length = 0; // Clear array
				nicks_com_mais_vitorias_na_semana.push(nick);
			} else if (datas_nicks_e_suas_quantidade_de_vitorias[k][nick] === maior_quantidade_de_vitorias_na_semana) {
				nicks_com_mais_vitorias_na_semana.push(nick);
			}
		}

		semanas_e_seus_nicks_com_maior_vitoria[k] = maior_quantidade_de_vitorias_na_semana !== 0
			? [nicks_com_mais_vitorias_na_semana, maior_quantidade_de_vitorias_na_semana]
			: 'Nenhuma luta essa semana.';

	}
	// ... (similar logic for meses_e_seus_nicks_com_maior_vitoria) ...

	// ... (aux initialization for nicks_e_suas_quantidade_de_vitorias)


	const finalAux = {};
	finalAux.meses = {};


	for (const mes in meses_e_seus_nicks_com_maior_vitoria) {
		const top = meses_e_seus_nicks_com_maior_vitoria[mes];
		finalAux.meses[mes] = {
			nicks: top[0],
			vitorias: top[1]
		};
	}


	finalAux.semanas = {};
	for (const semana in semanas_e_seus_nicks_com_maior_vitoria) {
		const top2 = semanas_e_seus_nicks_com_maior_vitoria[semana];

		finalAux.semanas[semana] = (top2.length === 2) ? {
			nicks: top2[0],
			vitorias: top2[1]
		} : { infos: top2 };
	}


	// Save data to files (using async/await with fs.promises)
	try {
		await fs.writeFile(output_path, JSON.stringify(finalAux, null, 4), 'utf-8'); // Use JSON.stringify
		await fs.writeFile(juiz_output_path, JSON.stringify(juizes_e_os_players_da_luta, null, 4), 'utf-8'); //Use JSON.stringify
		console.log(`\n\nProcessamento concluído! Resultado salvo em '${output_path}' e '${juiz_output_path}'`);

	} catch (err) {
		console.error("Error writing to files:", err);
		// Implement further error handling if necessary
	}


}

module.exports = { processDataAndSave };
