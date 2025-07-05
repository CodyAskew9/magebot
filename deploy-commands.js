const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('./config.json');

console.log('Loaded config:', config);

const commands = [
    {
        name: 'start',
        description: 'Start your mage journey and choose your class',
    },
    {
        name: 'profile',
        description: 'View your mage profile and stats',
    },
    {
        name: 'adventure',
        description: 'Go on an adventure to gain experience and gold',
    },
    {
        name: 'pvp',
        description: 'Challenge another player to a mage duel (Level 5+)',
        options: [
            {
                name: 'target',
                description: 'The player you want to challenge',
                type: 6, // USER type
                required: true,
            },
        ],
    },
    {
        name: 'spells',
        description: 'View your available spells',
    },
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})(); 