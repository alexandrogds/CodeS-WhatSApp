

const OpenAI = require("openai")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

(async ()=>{
    const response = await openai.chat.completions.create({
    model: "chatgpt-4o-latest",
    messages: [
        {
        "role": "user",
        "content": [
            {
            "type": "text",
            "text": "me de uma frase que inicia uma historia. somente retorne a frase que inicia a historia"
            }
        ]
        },
        {
        "role": "assistant",
        "content": [
            {
            "type": "text",
            "text": "A tempestade rugia lá fora quando Elisa encontrou a carta escondida no sótão."
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

    console.log(response.choices[0].message.content);
})