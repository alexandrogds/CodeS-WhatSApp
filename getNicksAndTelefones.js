const fs = require('fs')

async function getNicksAndTelefones(filePath) {
    try {
        const fileContent = await fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== "");

        const nicksETelefones = {};
        for (const line of lines) {
            const parts = line.split(' ');
            const nick = parts[0];
            const telefone = parts.slice(1).join(' ').match(/\d{8,}/); // Extract number with 8+ digits
            if (telefone) {
              nicksETelefones[nick] = telefone[0]; // Use only the matched number (string)
            } else {
                console.error(`No phone number found for nick: ${nick}`); // Or other error handling
            }
        }

        return nicksETelefones;


    } catch (error) {
        console.error("Error reading nicks and phones file:", error);
        return {};  // Return an empty object if there's an error
    }
}


// Example usage:
async function example() {
    const filePath = 'C:/Users/user/OneDrive/RPGs/Chapéus De Palha - Alex Thierry/nicks e telefones.md';
    const nicksAndPhones = await getNicksAndTelefones(filePath);
    console.log(nicksAndPhones);

    // You can now use nicksAndPhones in your bot.  Example:

    // Inside your Comandos function (after appropriate initialization):
    const nicks = Object.keys(nicksAndPhones); // Get all the nicks (keys of the object)
    const telefones = Object.values(nicksAndPhones); // Get all the phone numbers (values of the object)
    // ... use nicks and telefones arrays ...
}

example();


module.exports = getNicksAndTelefones;
