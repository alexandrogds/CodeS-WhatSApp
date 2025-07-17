

const { readFile } = require('../myfs.js')
const { removeFirst9After55 } = require('../lib.js')

async function send_file_membros_com_menções(message) {
    // enviar lista de membros do dragon no grupo que passo os contatos para thaty
    // entra aqui no debug e não no primeiro if pois a mensagem é enviada no grupo com thaty
    if (message.author != process.env.OWNER_NUMBER || message.from != process.env.GROUP_TO_SEND_CONTACTS_TO_RECRUIT_TO_THATY) {
        return
    }

    // const media = MessageMedia.fromFilePath(`./pictures/bloisinhos/blois${random_blois}.png`);
    // await client.sendMessage(message.from, media, { sendMediaAsSticker: true });

    // const chat = await message.getChat();
    // let mentions = [];
    // let pessoas = ''
    // for (let participantes of chat.participants) {
    //     mentions.push(`${participantes.id.user}@c.us`);
    //     pessoas += `|@${participantes.id.user} `;
    //     console.log(participantes);
    //     break
    // }
    // await chat.sendMessage(pessoas, {mentions});
    async function send_file_content_to_group_mentioning_numbers_of_content(file_path, group_id){
        let membros_msg = await readFile(file_path, 'utf-8');
        let numberPattern = /\d{8,}/g;  // matches 8 or more consecutive digits
        let numbers = membros_msg.match(numberPattern) || [];
        console.log(numbers)
        let mentions = [];
        for (let number of numbers) {
            mentions.push(`${removeFirst9After55(number)}@c.us`);
        }
        console.log(mentions)
        await global.client.sendMessage(group_id, membros_msg, { mentions: mentions });
    }

    let file_path; let group_id

    file_path = process.env.DRAGON_MEMBERS_IN_SHEET_CLOUD_FILE
    group_id = process.env.GROUP_TO_SEND_CONTACTS_TO_RECRUIT_TO_THATY
    await send_file_content_to_group_mentioning_numbers_of_content(file_path, group_id)

    file_path = process.env.DRAGON_MEMBERS_TO_PUT_IN_SHEET_CLOUD_FILE
    group_id = process.env.GROUP_TO_SEND_CONTACTS_TO_RECRUIT_TO_THATY
    await send_file_content_to_group_mentioning_numbers_of_content(file_path, group_id)
}

module.exports = { send_file_membros_com_menções }
