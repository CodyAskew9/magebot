const { Client, Intents } = require('discord.js');
const config = require('./config.json');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

client.once('ready', () => {
    console.log('=== Bot Information ===');
    console.log(`Bot Name: ${client.user.tag}`);
    console.log(`Bot ID: ${client.user.id}`);
    console.log(`Client ID: ${config.clientId}`);
    console.log('=======================');
    
    // Check if the client ID matches
    if (client.user.id === config.clientId) {
        console.log('✅ Client ID matches!');
    } else {
        console.log('❌ Client ID mismatch!');
        console.log(`Expected: ${config.clientId}`);
        console.log(`Actual: ${client.user.id}`);
    }
    
    process.exit(0);
});

client.on('error', (error) => {
    console.error('Bot error:', error);
    process.exit(1);
});

console.log('Testing bot connection...');
client.login(config.token); 