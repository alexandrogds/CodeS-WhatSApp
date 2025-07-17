// tem como iniciar várias instãncias do venom-bot

// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const venom = require('venom-bot');
const { get_Conversation_Reply, create_Input_Obj } = require('../../lib/openai.js');

const inputS = []
const system_Message = `
	You are a helpful assistant.
	You will answer the user's questions based on the context provided.".`;

const systemObj = create_Input_Obj('system', system_Message);
if (systemObj) inputS.push(systemObj);

venom
  .create({
    session: 'my_fisrt_code' //name of session
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
  console.log('Client is ready!');
  client.onMessage( async (message) => {
	console.log(`.is_Group:${message.isGroupMsg}.group===false:${message.isGroupMsg === false}.${message.from}`);
    if (message.isGroupMsg === false) {
	  console.log('Message private received: ', message.body);
	  let systemObj = create_Input_Obj(role='user', text=message.body);
	  if (systemObj) inputS.push(systemObj);
	  let obj = await get_Conversation_Reply(inputS)
	  let reply = obj.output_text;
	  let id = obj.output[0].id;
	  console.log('Reply to send: ', reply);
      client
        .sendText(message.from, reply)
        .then((result) => {
		  let systemObj = create_Input_Obj(role='assistant', text=reply, id=id);
	      if (systemObj) inputS.push(systemObj);
          console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    }
  });
}