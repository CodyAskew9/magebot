const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('./config.json');

const commands = [
    {
        name: 'start',
        description: 'Start your mage journey and choose your class'
    },
    {
        name: 'profile',
        description: 'View your mage profile and stats'
    },
    {
        name: 'adventure',
        description: 'Go on an adventure to gain experience and gold'
    },
    {
        name: 'pvp',
        description: 'Challenge another player to a mage duel (level 5+)',
        options: [
            {
                name: 'target',
                description: 'The player to challenge',
                type: 6, // USER type
                required: true
            }
        ]
    },
    {
        name: 'spells',
        description: 'View your learned spells'
    },
    {
        name: 'status',
        description: 'Check your current health and mana status'
    },
    {
        name: 'shop',
        description: 'View the magic shop'
    },
    {
        name: 'buy',
        description: 'Buy an item from the shop',
        options: [
            {
                name: 'item',
                description: 'The item to buy',
                type: 3, // STRING type
                required: true,
                choices: [
                    { name: 'Health Potion', value: 'health_potion' },
                    { name: 'Mana Potion', value: 'mana_potion' },
                    { name: 'Greater Health Potion', value: 'greater_health_potion' },
                    { name: 'Greater Mana Potion', value: 'greater_mana_potion' },
                    { name: 'Health Boost', value: 'health_boost' },
                    { name: 'Mana Boost', value: 'mana_boost' },
                    { name: 'Spell Scroll', value: 'spell_scroll' },
                    { name: 'Resurrection Scroll', value: 'resurrection_scroll' }
                ]
            }
        ]
    },
    {
        name: 'use',
        description: 'Use an item from your inventory',
        options: [
            {
                name: 'item',
                description: 'The item to use',
                type: 3, // STRING type
                required: true,
                choices: [
                    { name: 'Health Potion', value: 'health_potion' },
                    { name: 'Mana Potion', value: 'mana_potion' },
                    { name: 'Greater Health Potion', value: 'greater_health_potion' },
                    { name: 'Greater Mana Potion', value: 'greater_mana_potion' }
                ]
            }
        ]
    },
    {
        name: 'levelup',
        description: 'View level up information and available stat upgrades'
    },
    {
        name: 'reset',
        description: 'Reset your character to level 1 (WARNING: This will delete all progress!)'
    },
    {
        name: 'help',
        description: 'Show the list of available commands and game information'
    }
];

const rest = new REST({ version: '9' }).setToken(config.token);

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