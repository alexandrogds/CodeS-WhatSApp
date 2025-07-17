const OpenAI = require("openai")

try {
	require('dotenv').config({ path: '.env' });
} catch (e1) {
	try {
		require('dotenv').config({ path: '../.env' });
	} catch (e2) {
		console.warn('Arquivo .env não encontrado nas pastas padrão.');
	}
}

const openai = new OpenAI({
  apiKey: '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'
//   apiKey: process.env.OPENAI_API_KEY
    });

async function get_Message_Recruit(text='') {
	const response = await openai.responses.create({
		model: "gpt-4.1",
		input: [
			{
				"role": "system",
				"content": [
					{
					"type": "input_text",
					"text": "Responda as mensagens de forma super curta"
					}
				]
			},
			{
				"role": "user",
				"content": [
					{
					"type": "input_text",
					"text": "Crie uma mensagem diferente das anteriores e semelhante a \"Olá 😊, você quer fazer parte de um RPG 🎲🛡️ aqui no WhatsApp📱?\""
					}
				]
			}
		],
		text: {
			"format": {
				"type": "text"
			}
		},
		reasoning: {},
		tools: [],
		temperature: 1,
		max_output_tokens: 2048,
		top_p: 1,
		store: true	
	});
	// console.log(response)
    return response.output_text
}

var create_Input_Obj = function (role = null, text = null, id = null) {
  if (role === null || text === null) {
    console.log('role e text não podem ser null');
    return null;
  }
  // Se id não for nulo, sobrescreve role e type
  const isOutput = id !== null;
  return {
    role: role,
	...(id !== null && { id: id }),
    content: [
      {
        type: isOutput ? "output_text" : "input_text",
        text: text,
      }
    ]
  };
}

// async function get_Message_Recruit(system_Text=null, user_Text=null) {
async function get_Conversation_Reply(inputS=null) {
	// if (system_Text === null) {
	// 	console.log('system_Text não pode ser nulo');
	// 	return null;
	// } else if (user_Text === null) {
	// 	console.log('user_Text não pode ser nulo');
	// 	return null;
	// }
	if (inputS === null) {
		console.log('input não pode ser nulo');
		return null;
	} else {
		console.log('inputS:\n', inputS)
	}
	const response = await openai.responses.create({
		model: "gpt-4.1",
		input: inputS,
		text: {
			"format": {
				"type": "text"
			}
		},
		reasoning: {},
		tools: [],
		temperature: 1,
		max_output_tokens: 2048,
		top_p: 1,
		store: true	
	});
	// console.log(response)
    return response
}

module.exports = { get_Message_Recruit, get_Conversation_Reply, create_Input_Obj }
