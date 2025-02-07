

const OpenAI = require("openai")

require('dotenv').config({ path: '../.env' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
    });

async function get_of_open_ai(text) {
    const response = await openai.chat.completions.create({
        model: "chatgpt-4o-latest",
        messages: [
            {
                "role": "user",
                "content": [
                    {
                    "type": "text",
                    "text": text
                    }
                ]
            }
        ],
        response_format: {
            "type": "text"
        },
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    });

    return response.choices[0].message.content
}

// async function example() {
//     let text
//     text = 'me de uma frase que inicia uma historia. somente retorne a frase que inicia a historias'
//     await get_of_open_ai(text);

//     text = ''
//     await get_of_open_ai(text);
// }

// example()

module.exports = { get_of_open_ai }