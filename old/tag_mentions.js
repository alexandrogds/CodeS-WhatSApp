

async function tag_mentions(with_admins, hide, msg, message) {
    const chat = await message.getChat();
    let mentions = [];
    let pessoas = ''
    for (let participant of chat.participants) {
        if (with_admins) {
            mentions.push(`${participant.id.user}@c.us`);
            pessoas += `\n@+${participant.id.user} `;
        } else {
            if (participant.isAdmin) {
                continue
            }
            mentions.push(`${participant.id.user}@c.us`);
            pessoas += `\n@+${participant.id.user} `;
        }
    }
    // await chat.sendMessage(pessoas, {mentions});
    if (hide) {
        await chat.sendMessage(msg, {mentions});
    } else {
        await chat.sendMessage(`${msg}\n${pessoas}`, {mentions});
    }
}

module.exports = { tag_mentions }
