const { dddS } = require('./dddS');
const { appendFile, readFile, writeFile } = require('./myfs.js')
const { existsSync, writeFileSync } = require('fs');

async function _validNumber(number, clientWpp) {
	// talvez a função 'isRegisteredUser(id)' também seja útil
  try {
    var formattedNumber = number.replace(/[^0-9]/g, '');
    var numberId = await clientWpp.getNumberId(formattedNumber);
  } catch (error) {
    console.error('Erro:', error);
    return false;
  }
  console.log(formattedNumber, ':', !!numberId ? 'Válido' : 'Inválido');
  return !!numberId
}

async function validNumberSPhoneS(clientWpp) {
	// started with 9 with 9 digits
	// get first this with second digit are 6, 7 or 8
	// start in 2025-05-23
	const ddi = '55';
	const ddd = '95';
	const prefix = '96';
	const fileName1 = 'numberSPhoneSWithWpp.db';
	const fileName2 = 'numberSPhoneS.db';

	let start = 0;
	const content = await readFile(fileName2);
	if (content) {
		const lines = content.trim().split('\n');
		const last = lines[lines.length - 1];
		start = parseInt(last.slice(6), 10) + 1;
	}

	for (let i = start; i < Math.pow(10, 8); i++) {
		// sleep aleatório entre 0.75s e 1.25s
		await new Promise(resolve => setTimeout(resolve, 750 + Math.random() * 500));
		const num = ddi + ddd + prefix + i.toString().padStart(8, '0');
		await appendFile(fileName2, num);
		if (await _validNumber(num, clientWpp) !== false) {
			await appendFile(fileName1, num);
		}
	}
}

function _fixoS() {
	// numbers started with 2, 3, 4 or 5 with len of 8
	// in future incluir os starded with 6, 7, 8 and too with 9 digits
}

function _specialS() {
	// numbers of 3 a 4 dígitos iniciados por 1
}

async function validNumberSBiz(clientWpp) {
	// started with 800, 300 ou 900 and has len of 10 digits
	const prefix = '800';
	const fileName1 = 'numberSBizWithWpp.db';
	const fileName2 = 'numberSBiz.db';

	let start = 0;
	const content = await readFile(fileName2);
	if (content) {
		const lines = content.trim().split('\n');
		const last = lines[lines.length - 1];
		start = parseInt(last.slice(prefix.length), 10) + 1;
	}

	for (let i = start; i < Math.pow(10, 7); i++) {
		// sleep aleatório entre 0.75s e 1.25s
		await new Promise(resolve => setTimeout(resolve, 750 + Math.random() * 500));
		const num = prefix + i.toString().padStart(7, '0');
		await appendFile(fileName2, num);
		if (await _validNumber(num, clientWpp) !== false) {
			await appendFile(fileName1, num);
		}
	}
}

async function tests(clientWpp) {
	console.log('Iniciando testes de validação de números...');
	// Testes com números válidos e inválidos
	const testNumbers = [
		'5595981042843',
		'559581042843'
	];
	// Adicione mais números de teste conforme necessário
	console.log('Testando números:', testNumbers.join(', '));
	for (const num of testNumbers) {
		if (await _validNumber(num, clientWpp) !== false) {
			console.log(`Número ${num} é válido.`);
			return true;
		} else {
			console.log(`Número ${num} é inválido.`);
			return false
		}
	}
}

async function validNumberSPhoneS2(clientWpp) {
	// started with 9 with 9 digits
	// get first this with second digit are 6, 7 or 8
	// start in 2025-05-23
	const ddi = '55';
	const ddd = '95';
	const prefix = '96';
	const fileName1 = 'numberS_PhoneS_WithWpp.db';
	const fileName2 = 'numberS_PhoneS.db';

	let start = 0;
	const content = await readFile(fileName2);
	if (content) {
		const lines = content.trim().split('\n');
		const last = lines[lines.length - 1];
		start = parseInt(last.slice(6), 10) + 1;
	}

	function hasFourPairsAndFourUniques(num8) {
		// num8: string com 8 dígitos
		const counts = {};
		for (const d of num8) {
			counts[d] = (counts[d] || 0) + 1;
		}
		let pairs = 0, uniques = 0;
		for (const v of Object.values(counts)) {
			if (v === 2) pairs++;
			if (v === 1) uniques++;
		}
		return pairs === 1 && uniques === 7;
	}

	for (let i = start; i < Math.pow(10, 8); i++) {
		// sleep aleatório entre 0.75s e 1.25s
		await new Promise(resolve => setTimeout(resolve, 750 + Math.random() * 500));
		const num = ddi + ddd + prefix + i.toString().padStart(8, '0');
		const num8 = i.toString().padStart(8, '0');
		if (!hasFourPairsAndFourUniques(num8)) continue;
		console.log(num, ':', hasFourPairsAndFourUniques(num8) ? 'Válido' : 'Inválido');
		await appendFile(fileName1, num); continue;
		if (await _validNumber(num, clientWpp) !== false) {
			await appendFile(fileName1, num);
		}
	}
};

/**
 * Gera um número aleatório de 8 dígitos com exatamente 2 dígitos únicos:
 * - Um dígito aparece apenas entre os 4 primeiros dígitos
 * - O outro dígito aparece apenas entre os 4 últimos dígitos
 * Retorna como string.
 * 
 * Necessita de mais poder de processamento.
 */
function _random_Generate_False() {
	// Escolhe dois dígitos únicos diferentes
	const digits = [];
	while (digits.length < 2) {
		const d = Math.floor(Math.random() * 10).toString();
		if (!digits.includes(d)) digits.push(d);
	}
	// Gera os 4 primeiros e 4 últimos dígitos
	const first4 = Array(4).fill(digits[0]);
	const last4 = Array(4).fill(digits[1]);
	// Embaralha cada parte separadamente
	for (let i = first4.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[first4[i], first4[j]] = [first4[j], first4[i]];
	}
	for (let i = last4.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[last4[i], last4[j]] = [last4[j], last4[i]];
	}
	return first4.join('') + last4.join('');
}

/**
 * Gera um número aleatório de 'len' dígitos como string.
 * @param {number} len - Quantidade de dígitos
 * @returns {string}
 */
function _generate_Random(len) {
	let result = '';
	for (let i = 0; i < len; i++) {
		result += Math.floor(Math.random() * 10).toString();
	}
	return result;
}

async function valid_NumberS_Phone_3(clientWpp) {
	_create_FileS_For_Valid_NumberS_Phone_3();
	const ddi = '55';
	const ddd = '95';
	const prefix = '98';
	while (true) {
		await new Promise(resolve => setTimeout(resolve, 750 + Math.random() * 500));
		const num = _generate_Random(7);
		const fullNum = ddi + ddd + prefix + num;
		await appendFile('numberS_PhoneS_3.db', fullNum);
		console.log('Número gerado:', fullNum);
		if (await _validNumber(fullNum, clientWpp) !== false) {
			await appendFile('numberS_PhoneS_WithWpp_3.db', fullNum);
			console.log('Número válido:', fullNum);
		}
	}
}

/**
 * Cria os arquivos necessários para valid_NumberS_Phone_3, se não existirem.
 */
function _create_FileS_For_Valid_NumberS_Phone_3() {
	const files = [
		'numberS_PhoneS_3.db',
		'numberS_PhoneS_WithWpp_3.db'
	];
	for (const file of files) {
		if (!existsSync(file)) {
			writeFileSync(file, '');
		}
	}
}

module.exports = { validNumberSBiz, valid_NumberS_Phone_3,
	validNumberSPhoneS, tests, _generate_Random, 
	_create_FileS_For_Valid_NumberS_Phone_3 };
