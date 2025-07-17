const { readFile } = require('./myfs.js') // const the functions
const { generateTable } = require('./arena_sc/generateTable.js')
const { getWinnersAndTheirFights } = require('./arena_sc/getWinnersAndTheirFights.js')

require('dotenv').config();

// const EventEmitter = require('events');
// const client = new EventEmitter();

const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'client-one' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const qrcode = require('qrcode-terminal');
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('Client is authenticated!');
});

const generateRandomMessage = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const msg = generateRandomMessage(20)

// Mock Comandos function for testing
// const Comandos = jest.fn(async (message) => {
    // Mock implementation for testing.  You can customize this
    // to simulate different command behaviors.  For example:
// });

const { Comandos } = require('./main');

let lista_comandos = new Set(['Dg', 'Menu', 'tag'].map(cmd => process.env.PREFIX + cmd))
let messagem_from_list = new Set([process.env.TEST_GROUP, process.env.ARENASC, process.env.BOT_NUMBER, process.env.DRAGON_GAKURE])

client.on('message_create', async message => {
    if ([...lista_comandos].some(cmd => cmd.toLowerCase() === String.raw`${message.body}`.toLowerCase())) {
        await Comandos(message);
    } else if ([...messagem_from_list].some(from => from === String.raw`${message.from}`.toLowerCase())) {
        if (message.body.length > 16) {
            await Comandos(message);
        }
    }
});

// Mock message object for testing
const createMockMessage = (body, from, author) => ({
    body,
    from,
    author, // Add author property
    timestamp: Date.now() / 1000,
    reply: jest.fn(),
    getChat: jest.fn(async () => ({ participants: [] })), // Mock getChat
    sendMessage: jest.fn(), // Mock sendMessage
});

client.initialize();

describe('Message Handling', () => {
    beforeEach(() => {
    });

    it('should call Comandos for valid command', async () => {
        const message = createMockMessage('.tag', process.env.OWNER_NUMBER);
        await client.emit('message_create', message);
        expect(Comandos).toHaveBeenCalledTimes(1);
        expect(Comandos).toHaveBeenCalledWith(message);
    });

    it('should not call Comandos for invalid command', async () => {
        const message = createMockMessage('!invalid', 'user1');
        await client.emit('message_create', message);
        expect(Comandos).not.toHaveBeenCalled();
    });

    it('should call Comandos for test group or arena', async () => {
        const message = createMockMessage(msg, process.env.TEST_GROUP || process.env.ARENASC); // provide a default if env is not set
        await client.emit('message_create', message);
        expect(Comandos).toHaveBeenCalledTimes(1);
        expect(Comandos).toHaveBeenCalledWith(message);
    });

    it('should handle arena sc message correctly', async () => {
        const message = createMockMessage('K.Kaiser🌸✴️\n0❤‍🩹 400💠\n\n\n🆚\n\nIsagi🧚🏻‍♀️🔅\n200❤‍🩹 400💠', process.env.ARENASC, process.env.OWNER_NUMBER);

        await Comandos(message);

        let winners = await readFile(process.env.WINNERS_ARENA_SC)
        winners = JSON.parse(winners)
        let winnersAndTheirFights = await getWinnersAndTheirFights(winners)
        let table = await generateTable(winnersAndTheirFights)

        let group_arena_sc
        if (process.env.DEBUG) {
            group_arena_sc = process.env.TEST_GROUP
        } else {
            group_arena_sc = process.env.ARENASC
        }

        expect(client.sendMessage).toHaveBeenCalledWith(group_arena_sc, table);
    });

});


// Initialize client *after* tests are defined (important!)
// client.initialize();

// Mock console.error for error handling tests
console.error = jest.fn();

// Before running tests, ensure you have jest installed:
// npm install --save-dev jest

// And then run your tests with:
// npx jest