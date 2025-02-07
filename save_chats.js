

const saveChatHistory = async (chat) => {
    try {
      const messages = await chat.fetchMessages({ limit: Infinity }); // Busca todas as mensagens

      let chatHistory = "";
      for (const message of messages) {
        const timestamp = message.timestamp;
        const from = message.fromMe ? 'Eu' : message.author || message.from; // Ajusta para casos de grupos
        const body = message.body;
        // Formata a mensagem (pode ser customizado)
          chatHistory += `${new Date(timestamp * 1000).toLocaleString()}: ${from}: ${body}\n`;


      }

        const fileName = `chat_${chat.name ? chat.name.replace(/[^a-zA-Z0-9]/g, '_') : chat.id.user}.txt`;
        const fs = require('fs');
        fs.writeFile(fileName, chatHistory, (err) => {
          if (err) {
            console.error(`Erro ao salvar o histórico do chat ${chat.name || chat.id.user}:`, err);
          } else {
            console.log(`Histórico do chat ${chat.name || chat.id.user} salvo em ${fileName}`);
          }
        });

    } catch (err) {
        console.error(`Erro ao buscar mensagens do chat ${chat.name || chat.id.user}:`, err);
    }

};

function save_chats(message) {
    if (message.from != process.env.OWNER_NUMBER || message.to != process.env.BOT_NUMBER) {
        return
    }

    //obtem todos os chats
    global.client.getChats().then(chats => {
        // Itera sobre todos os chats
        chats.forEach(chat => {

            saveChatHistory(chat);
            return

        });

    });
}

module.exports = { save_chats }
