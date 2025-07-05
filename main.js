const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

// Spell rarity system
const spellRarities = {
    common: { chance: 0.5, multiplier: 1.0, color: '#9CA3AF' },
    uncommon: { chance: 0.3, multiplier: 1.3, color: '#10B981' },
    rare: { chance: 0.15, multiplier: 1.6, color: '#3B82F6' },
    epic: { chance: 0.04, multiplier: 2.0, color: '#8B5CF6' },
    legendary: { chance: 0.01, multiplier: 2.5, color: '#F59E0B' }
};

// Shop system
const shopItems = {
    health_potion: {
        name: "Health Potion",
        description: "Restore 50 health points",
        cost: 25,
        effect: { health: 50, mana: 0 },
        emoji: "❤️"
    },
    mana_potion: {
        name: "Mana Potion", 
        description: "Restore 50 mana points",
        cost: 25,
        effect: { health: 0, mana: 50 },
        emoji: "🔮"
    },
    greater_health_potion: {
        name: "Greater Health Potion",
        description: "Restore 100 health points",
        cost: 50,
        effect: { health: 100, mana: 0 },
        emoji: "💖"
    },
    greater_mana_potion: {
        name: "Greater Mana Potion",
        description: "Restore 100 mana points", 
        cost: 50,
        effect: { health: 0, mana: 100 },
        emoji: "🔯"
    },
    health_boost: {
        name: "Health Boost",
        description: "Permanently increase max health by 20",
        cost: 100,
        effect: { maxHealth: 20, maxMana: 0 },
        emoji: "💪"
    },
    mana_boost: {
        name: "Mana Boost",
        description: "Permanently increase max mana by 15",
        cost: 100,
        effect: { maxHealth: 0, maxMana: 15 },
        emoji: "🧠"
    },
    spell_scroll: {
        name: "Spell Scroll",
        description: "Learn a random spell for your class",
        cost: 150,
        effect: { spellScroll: true },
        emoji: "📜"
    },
    resurrection_scroll: {
        name: "Resurrection Scroll",
        description: "Revive once if you die (consumed on death)",
        cost: 300,
        effect: { resurrection: true },
        emoji: "⚰️"
    }
};

// Random encounter system
const encounters = {
    peaceful: [
        { name: "Ancient Library", description: "You discover a hidden library with magical knowledge.", exp: 15, gold: 10, health: 0, mana: 20, chance: 0.3 },
        { name: "Healing Spring", description: "A magical spring restores your vitality.", exp: 10, gold: 5, health: 30, mana: 15, chance: 0.25 },
        { name: "Merchant Caravan", description: "A friendly merchant shares some supplies.", exp: 12, gold: 15, health: 10, mana: 10, chance: 0.2 },
        { name: "Mystical Grove", description: "The peaceful grove grants you wisdom.", exp: 18, gold: 8, health: 15, mana: 25, chance: 0.15 },
        { name: "Treasure Chest", description: "You find a chest with valuable loot!", exp: 20, gold: 25, health: 0, mana: 0, chance: 0.1 }
    ],
    dangerous: [
        { name: "Goblin Ambush", description: "Goblins jump out from the shadows!", health: 80, damage: 15, exp: 25, gold: 20, chance: 0.25 },
        { name: "Poisonous Trap", description: "You trigger a deadly trap!", health: 60, damage: 25, exp: 20, gold: 15, chance: 0.2 },
        { name: "Dark Wizard", description: "A rogue mage challenges you to a duel!", health: 120, damage: 30, exp: 35, gold: 30, chance: 0.15 },
        { name: "Ancient Guardian", description: "A stone guardian awakens to protect its treasure!", health: 150, damage: 35, exp: 40, gold: 40, chance: 0.1 },
        { name: "Dragon Whelp", description: "A young dragon blocks your path!", health: 200, damage: 40, exp: 50, gold: 50, chance: 0.05 }
    ],
    deadly: [
        { name: "Lich Lord", description: "An undead lord rises from the shadows!", health: 300, damage: 50, exp: 75, gold: 75, chance: 0.03 },
        { name: "Demon Prince", description: "A demonic prince emerges from a portal!", health: 400, damage: 60, exp: 100, gold: 100, chance: 0.02 },
        { name: "Ancient Dragon", description: "A massive dragon awakens from its slumber!", health: 500, damage: 70, exp: 150, gold: 150, chance: 0.01 }
    ]
};

// Spell templates by element and level
const spellTemplates = {
    fire: {
        1: [
            { name: "Ember", baseDamage: 15, baseMana: 10, effect: null },
            { name: "Spark", baseDamage: 18, baseMana: 12, effect: null },
            { name: "Flame Touch", baseDamage: 20, baseMana: 15, effect: "burn" },
            { name: "Heat Wave", baseDamage: 12, baseMana: 8, effect: null }
        ],
        2: [
            { name: "Fireball", baseDamage: 25, baseMana: 15, effect: null },
            { name: "Burning Hands", baseDamage: 30, baseMana: 20, effect: "burn" },
            { name: "Flame Shield", baseDamage: 0, baseMana: 25, effect: "shield" },
            { name: "Searing Ray", baseDamage: 35, baseMana: 25, effect: null }
        ],
        3: [
            { name: "Flame Burst", baseDamage: 40, baseMana: 25, effect: null },
            { name: "Infernal Blast", baseDamage: 45, baseMana: 30, effect: "burn" },
            { name: "Phoenix Feather", baseDamage: 50, baseMana: 35, effect: "heal" },
            { name: "Molten Strike", baseDamage: 55, baseMana: 40, effect: null }
        ],
        4: [
            { name: "Inferno", baseDamage: 60, baseMana: 40, effect: "burn" },
            { name: "Flame Storm", baseDamage: 65, baseMana: 45, effect: null },
            { name: "Burning Rain", baseDamage: 70, baseMana: 50, effect: "burn" },
            { name: "Volcanic Eruption", baseDamage: 75, baseMana: 55, effect: null }
        ],
        5: [
            { name: "Phoenix Strike", baseDamage: 80, baseMana: 50, effect: "burn" },
            { name: "Dragon's Breath", baseDamage: 85, baseMana: 55, effect: "burn" },
            { name: "Hellfire", baseDamage: 90, baseMana: 60, effect: "burn" },
            { name: "Solar Flare", baseDamage: 95, baseMana: 65, effect: null }
        ],
        6: [
            { name: "Meteor Strike", baseDamage: 100, baseMana: 70, effect: "burn" },
            { name: "Plasma Burst", baseDamage: 110, baseMana: 75, effect: null },
            { name: "Nova Explosion", baseDamage: 120, baseMana: 80, effect: "burn" },
            { name: "Supernova", baseDamage: 130, baseMana: 85, effect: null }
        ],
        7: [
            { name: "Ragnarok", baseDamage: 150, baseMana: 100, effect: "burn" },
            { name: "Apocalypse", baseDamage: 160, baseMana: 110, effect: "burn" },
            { name: "Armageddon", baseDamage: 170, baseMana: 120, effect: "burn" },
            { name: "Doomsday", baseDamage: 180, baseMana: 130, effect: null }
        ]
    },
    water: {
        1: [
            { name: "Water Drop", baseDamage: 12, baseMana: 8, effect: null },
            { name: "Splash", baseDamage: 15, baseMana: 10, effect: null },
            { name: "Frost Touch", baseDamage: 18, baseMana: 12, effect: "freeze" },
            { name: "Mist", baseDamage: 10, baseMana: 6, effect: null }
        ],
        2: [
            { name: "Water Bolt", baseDamage: 20, baseMana: 10, effect: null },
            { name: "Ice Shield", baseDamage: 0, baseMana: 20, effect: "shield" },
            { name: "Healing Rain", baseDamage: -25, baseMana: 25, effect: "heal" },
            { name: "Frost Bolt", baseDamage: 25, baseMana: 15, effect: "freeze" }
        ],
        3: [
            { name: "Tidal Wave", baseDamage: 45, baseMana: 30, effect: null },
            { name: "Ice Storm", baseDamage: 50, baseMana: 35, effect: "freeze" },
            { name: "Aqua Heal", baseDamage: -40, baseMana: 30, effect: "heal" },
            { name: "Frost Nova", baseDamage: 55, baseMana: 40, effect: "freeze" }
        ],
        4: [
            { name: "Tsunami", baseDamage: 70, baseMana: 45, effect: null },
            { name: "Blizzard", baseDamage: 75, baseMana: 50, effect: "freeze" },
            { name: "Ocean's Blessing", baseDamage: -60, baseMana: 45, effect: "heal" },
            { name: "Arctic Storm", baseDamage: 80, baseMana: 55, effect: "freeze" }
        ],
        5: [
            { name: "Ice Age", baseDamage: 90, baseMana: 60, effect: "freeze" },
            { name: "Deep Freeze", baseDamage: 95, baseMana: 65, effect: "freeze" },
            { name: "Polar Vortex", baseDamage: 100, baseMana: 70, effect: "freeze" },
            { name: "Glacial Strike", baseDamage: 105, baseMana: 75, effect: null }
        ],
        6: [
            { name: "Frozen Hell", baseDamage: 120, baseMana: 80, effect: "freeze" },
            { name: "Avalanche", baseDamage: 130, baseMana: 85, effect: null },
            { name: "Permafrost", baseDamage: 140, baseMana: 90, effect: "freeze" },
            { name: "Cryogenic Burst", baseDamage: 150, baseMana: 95, effect: "freeze" }
        ],
        7: [
            { name: "Absolute Zero", baseDamage: 170, baseMana: 110, effect: "freeze" },
            { name: "Frozen Time", baseDamage: 180, baseMana: 120, effect: "freeze" },
            { name: "Ice Apocalypse", baseDamage: 190, baseMana: 130, effect: "freeze" },
            { name: "Frost Armageddon", baseDamage: 200, baseMana: 140, effect: null }
        ]
    },
    earth: {
        1: [
            { name: "Pebble", baseDamage: 10, baseMana: 6, effect: null },
            { name: "Stone Throw", baseDamage: 15, baseMana: 10, effect: null },
            { name: "Rock Shield", baseDamage: 0, baseMana: 15, effect: "shield" },
            { name: "Dirt Clod", baseDamage: 8, baseMana: 5, effect: null }
        ],
        2: [
            { name: "Earth Shield", baseDamage: 0, baseMana: 25, effect: "shield" },
            { name: "Stone Fist", baseDamage: 25, baseMana: 15, effect: null },
            { name: "Mountain's Strength", baseDamage: 30, baseMana: 20, effect: "shield" },
            { name: "Crystal Strike", baseDamage: 35, baseMana: 25, effect: null }
        ],
        3: [
            { name: "Rock Slide", baseDamage: 50, baseMana: 35, effect: null },
            { name: "Crystal Barrier", baseDamage: 0, baseMana: 40, effect: "shield" },
            { name: "Mountain's Fury", baseDamage: 55, baseMana: 40, effect: null },
            { name: "Diamond Edge", baseDamage: 60, baseMana: 45, effect: null }
        ],
        4: [
            { name: "Earthquake", baseDamage: 75, baseMana: 50, effect: null },
            { name: "Crystal Storm", baseDamage: 80, baseMana: 55, effect: null },
            { name: "Mountain's Wrath", baseDamage: 85, baseMana: 60, effect: null },
            { name: "Tectonic Shift", baseDamage: 90, baseMana: 65, effect: null }
        ],
        5: [
            { name: "Continental Drift", baseDamage: 100, baseMana: 70, effect: null },
            { name: "Crystal Apocalypse", baseDamage: 110, baseMana: 75, effect: null },
            { name: "Mountain's End", baseDamage: 120, baseMana: 80, effect: null },
            { name: "Tectonic Collapse", baseDamage: 130, baseMana: 85, effect: null }
        ],
        6: [
            { name: "Planetary Strike", baseDamage: 140, baseMana: 90, effect: null },
            { name: "Crystal Armageddon", baseDamage: 150, baseMana: 95, effect: null },
            { name: "Mountain's Death", baseDamage: 160, baseMana: 100, effect: null },
            { name: "Tectonic Apocalypse", baseDamage: 170, baseMana: 105, effect: null }
        ],
        7: [
            { name: "World Ender", baseDamage: 180, baseMana: 120, effect: null },
            { name: "Crystal Doomsday", baseDamage: 190, baseMana: 130, effect: null },
            { name: "Mountain's End", baseDamage: 200, baseMana: 140, effect: null },
            { name: "Tectonic Armageddon", baseDamage: 210, baseMana: 150, effect: null }
        ]
    },
    wind: {
        1: [
            { name: "Breeze", baseDamage: 8, baseMana: 5, effect: null },
            { name: "Wind Slash", baseDamage: 12, baseMana: 8, effect: null },
            { name: "Gust", baseDamage: 15, baseMana: 10, effect: null },
            { name: "Air Current", baseDamage: 10, baseMana: 6, effect: null }
        ],
        2: [
            { name: "Wind Blade", baseDamage: 20, baseMana: 12, effect: null },
            { name: "Cyclone", baseDamage: 25, baseMana: 15, effect: null },
            { name: "Air Shield", baseDamage: 0, baseMana: 20, effect: "shield" },
            { name: "Wind Strike", baseDamage: 30, baseMana: 20, effect: null }
        ],
        3: [
            { name: "Tornado", baseDamage: 55, baseMana: 35, effect: null },
            { name: "Hurricane", baseDamage: 60, baseMana: 40, effect: null },
            { name: "Wind Wall", baseDamage: 0, baseMana: 45, effect: "shield" },
            { name: "Storm Strike", baseDamage: 65, baseMana: 45, effect: null }
        ],
        4: [
            { name: "Storm Call", baseDamage: 85, baseMana: 55, effect: null },
            { name: "Typhoon", baseDamage: 90, baseMana: 60, effect: null },
            { name: "Wind Apocalypse", baseDamage: 95, baseMana: 65, effect: null },
            { name: "Tempest", baseDamage: 100, baseMana: 70, effect: null }
        ],
        5: [
            { name: "Wind Armageddon", baseDamage: 110, baseMana: 75, effect: null },
            { name: "Storm Apocalypse", baseDamage: 120, baseMana: 80, effect: null },
            { name: "Hurricane Hell", baseDamage: 130, baseMana: 85, effect: null },
            { name: "Wind Doomsday", baseDamage: 140, baseMana: 90, effect: null }
        ],
        6: [
            { name: "Wind Apocalypse", baseDamage: 150, baseMana: 95, effect: null },
            { name: "Storm Armageddon", baseDamage: 160, baseMana: 100, effect: null },
            { name: "Hurricane Apocalypse", baseDamage: 170, baseMana: 105, effect: null },
            { name: "Wind End Times", baseDamage: 180, baseMana: 110, effect: null }
        ],
        7: [
            { name: "Wind Doomsday", baseDamage: 190, baseMana: 120, effect: null },
            { name: "Storm Doomsday", baseDamage: 200, baseMana: 130, effect: null },
            { name: "Hurricane Doomsday", baseDamage: 210, baseMana: 140, effect: null },
            { name: "Wind Armageddon", baseDamage: 220, baseMana: 150, effect: null }
        ]
    },
    light: {
        1: [
            { name: "Light Touch", baseDamage: 10, baseMana: 6, effect: null },
            { name: "Light Bolt", baseDamage: 15, baseMana: 10, effect: null },
            { name: "Heal", baseDamage: -20, baseMana: 15, effect: "heal" },
            { name: "Divine Spark", baseDamage: 12, baseMana: 8, effect: null }
        ],
        2: [
            { name: "Divine Strike", baseDamage: 25, baseMana: 15, effect: null },
            { name: "Holy Light", baseDamage: -30, baseMana: 25, effect: "heal" },
            { name: "Light Shield", baseDamage: 0, baseMana: 20, effect: "shield" },
            { name: "Sacred Bolt", baseDamage: 30, baseMana: 20, effect: null }
        ],
        3: [
            { name: "Holy Nova", baseDamage: 45, baseMana: 30, effect: null },
            { name: "Divine Heal", baseDamage: -50, baseMana: 35, effect: "heal" },
            { name: "Sacred Shield", baseDamage: 0, baseMana: 40, effect: "shield" },
            { name: "Light Apocalypse", baseDamage: 55, baseMana: 40, effect: null }
        ],
        4: [
            { name: "Divine Storm", baseDamage: 65, baseMana: 40, effect: null },
            { name: "Holy Apocalypse", baseDamage: -70, baseMana: 45, effect: "heal" },
            { name: "Sacred Apocalypse", baseDamage: 0, baseMana: 50, effect: "shield" },
            { name: "Light Armageddon", baseDamage: 75, baseMana: 50, effect: null }
        ],
        5: [
            { name: "Divine Armageddon", baseDamage: 85, baseMana: 55, effect: null },
            { name: "Holy Armageddon", baseDamage: -90, baseMana: 60, effect: "heal" },
            { name: "Sacred Armageddon", baseDamage: 0, baseMana: 65, effect: "shield" },
            { name: "Light Doomsday", baseDamage: 95, baseMana: 70, effect: null }
        ],
        6: [
            { name: "Divine Doomsday", baseDamage: 105, baseMana: 75, effect: null },
            { name: "Holy Doomsday", baseDamage: -110, baseMana: 80, effect: "heal" },
            { name: "Sacred Doomsday", baseDamage: 0, baseMana: 85, effect: "shield" },
            { name: "Light End Times", baseDamage: 115, baseMana: 90, effect: null }
        ],
        7: [
            { name: "Divine End Times", baseDamage: 125, baseMana: 95, effect: null },
            { name: "Holy End Times", baseDamage: -130, baseMana: 100, effect: "heal" },
            { name: "Sacred End Times", baseDamage: 0, baseMana: 105, effect: "shield" },
            { name: "Light Finale", baseDamage: 135, baseMana: 110, effect: null }
        ]
    },
    dark: {
        1: [
            { name: "Shadow Touch", baseDamage: 12, baseMana: 8, effect: null },
            { name: "Shadow Bolt", baseDamage: 18, baseMana: 12, effect: null },
            { name: "Life Drain", baseDamage: 20, baseMana: 15, effect: "drain" },
            { name: "Dark Mist", baseDamage: 10, baseMana: 6, effect: null }
        ],
        2: [
            { name: "Death Grip", baseDamage: 25, baseMana: 15, effect: "drain" },
            { name: "Shadow Strike", baseDamage: 30, baseMana: 20, effect: null },
            { name: "Void Touch", baseDamage: 35, baseMana: 25, effect: "drain" },
            { name: "Dark Shield", baseDamage: 0, baseMana: 20, effect: "shield" }
        ],
        3: [
            { name: "Void Blast", baseDamage: 50, baseMana: 35, effect: "drain" },
            { name: "Shadow Apocalypse", baseDamage: 55, baseMana: 40, effect: null },
            { name: "Death Nova", baseDamage: 60, baseMana: 45, effect: "drain" },
            { name: "Dark Storm", baseDamage: 65, baseMana: 50, effect: null }
        ],
        4: [
            { name: "Void Storm", baseDamage: 75, baseMana: 50, effect: "drain" },
            { name: "Shadow Armageddon", baseDamage: 80, baseMana: 55, effect: null },
            { name: "Death Storm", baseDamage: 85, baseMana: 60, effect: "drain" },
            { name: "Dark Apocalypse", baseDamage: 90, baseMana: 65, effect: null }
        ],
        5: [
            { name: "Void Armageddon", baseDamage: 100, baseMana: 70, effect: "drain" },
            { name: "Shadow Doomsday", baseDamage: 105, baseMana: 75, effect: null },
            { name: "Death Armageddon", baseDamage: 110, baseMana: 80, effect: "drain" },
            { name: "Dark Doomsday", baseDamage: 115, baseMana: 85, effect: null }
        ],
        6: [
            { name: "Void Doomsday", baseDamage: 125, baseMana: 90, effect: "drain" },
            { name: "Shadow End Times", baseDamage: 130, baseMana: 95, effect: null },
            { name: "Death Doomsday", baseDamage: 135, baseMana: 100, effect: "drain" },
            { name: "Dark End Times", baseDamage: 140, baseMana: 105, effect: null }
        ],
        7: [
            { name: "Void End Times", baseDamage: 150, baseMana: 110, effect: "drain" },
            { name: "Shadow Finale", baseDamage: 155, baseMana: 115, effect: null },
            { name: "Death End Times", baseDamage: 160, baseMana: 120, effect: "drain" },
            { name: "Dark Finale", baseDamage: 165, baseMana: 125, effect: null }
        ]
    }
};

// Game data
const mageClasses = {
    fire: {
        name: "Fire Mage",
        description: "Masters of destructive flame magic"
    },
    water: {
        name: "Water Mage", 
        description: "Controllers of healing and ice magic"
    },
    earth: {
        name: "Earth Mage",
        description: "Defenders with powerful earth magic"
    },
    wind: {
        name: "Wind Mage",
        description: "Swift and agile air magic users"
    },
    light: {
        name: "Light Mage",
        description: "Holy magic wielders with healing powers"
    },
    dark: {
        name: "Dark Mage",
        description: "Masters of shadow and necromancy"
    }
};

// Player data storage
let playerData = {};

// Load player data
function loadPlayerData() {
    try {
        if (fs.existsSync(config.dataFile)) {
            const data = fs.readFileSync(config.dataFile, 'utf8');
            playerData = JSON.parse(data);
            console.log('Player data loaded successfully');
        } else {
            console.log('No player data file found, starting with empty data');
            playerData = {};
            savePlayerData(); // Create the initial file
        }
    } catch (error) {
        console.error('Error loading player data:', error);
        playerData = {};
        savePlayerData(); // Try to create a fresh file
    }
}

// Save player data
function savePlayerData() {
    try {
        fs.writeFileSync(config.dataFile, JSON.stringify(playerData, null, 2));
        console.log('Player data saved successfully');
    } catch (error) {
        console.error('Error saving player data:', error);
        // Try to create the directory if it doesn't exist
        try {
            const dir = require('path').dirname(config.dataFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(config.dataFile, JSON.stringify(playerData, null, 2));
            console.log('Player data saved successfully after creating directory');
        } catch (dirError) {
            console.error('Failed to create directory and save player data:', dirError);
        }
    }
}

// Generate random rarity
function getRandomRarity() {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [rarity, data] of Object.entries(spellRarities)) {
        cumulative += data.chance;
        if (rand <= cumulative) {
            return rarity;
        }
    }
    return 'common'; // fallback
}

// Generate random spell for a class and level
function generateRandomSpell(mageClass, level) {
    const templates = spellTemplates[mageClass][level];
    if (!templates || templates.length === 0) {
        return null;
    }
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const rarity = getRandomRarity();
    const rarityData = spellRarities[rarity];
    
    return {
        name: template.name,
        damage: Math.floor(template.baseDamage * rarityData.multiplier),
        mana: Math.floor(template.baseMana * rarityData.multiplier),
        level: level,
        effect: template.effect,
        rarity: rarity,
        rarityColor: rarityData.color
    };
}

// Get random encounter
function getRandomEncounter() {
    const rand = Math.random();
    
    // 60% chance of peaceful encounter
    if (rand < 0.6) {
        const peaceful = encounters.peaceful[Math.floor(Math.random() * encounters.peaceful.length)];
        return { ...peaceful, type: 'peaceful' };
    }
    // 35% chance of dangerous encounter
    else if (rand < 0.95) {
        const dangerous = encounters.dangerous[Math.floor(Math.random() * encounters.dangerous.length)];
        return { ...dangerous, type: 'dangerous' };
    }
    // 5% chance of deadly encounter
    else {
        const deadly = encounters.deadly[Math.floor(Math.random() * encounters.deadly.length)];
        return { ...deadly, type: 'deadly' };
    }
}

// Simulate combat with monster
async function simulateCombat(player, monster, interaction) {
    let playerHealth = player.health;
    let monsterHealth = monster.health;
    let combatLog = [];
    let round = 1;
    
    while (playerHealth > 0 && monsterHealth > 0 && round <= 15) {
        // Player's turn
        if (player.spells.length > 0) {
            const spell = player.spells[Math.floor(Math.random() * player.spells.length)];
            const damage = Math.floor(spell.damage * (0.8 + Math.random() * 0.4));
            monsterHealth -= damage;
            combatLog.push(`**Round ${round}:** You cast ${spell.name} for ${damage} damage!`);
        } else {
            // Basic attack if no spells
            const damage = Math.floor(10 * (0.8 + Math.random() * 0.4));
            monsterHealth -= damage;
            combatLog.push(`**Round ${round}:** You attack for ${damage} damage!`);
        }
        
        if (monsterHealth <= 0) break;
        
        // Monster's turn
        const monsterDamage = Math.floor(monster.damage * (0.8 + Math.random() * 0.4));
        playerHealth -= monsterDamage;
        combatLog.push(`**Round ${round}:** ${monster.name} attacks for ${monsterDamage} damage!`);
        
        round++;
    }
    
    const victory = playerHealth > 0;
    return { victory, playerHealth, monsterHealth, combatLog };
}

// Initialize new player
function initializePlayer(userId) {
    if (!playerData[userId]) {
        playerData[userId] = {
            level: 1,
            experience: 0,
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            class: null,
            spells: [],
            gold: 0,
            inventory: {},
            resurrectionScroll: false,
            lastDaily: 0,
            pvpWins: 0,
            pvpLosses: 0
        };
        savePlayerData();
    }
    return playerData[userId];
}

// Calculate experience needed for next level
function getExpForLevel(level) {
    return level * 100;
}

// Level up options
const levelUpOptions = [
    {
        name: "Health Boost",
        description: "Increase max health by 30",
        effect: { maxHealth: 30, maxMana: 0 },
        emoji: "❤️"
    },
    {
        name: "Mana Boost", 
        description: "Increase max mana by 25",
        effect: { maxHealth: 0, maxMana: 25 },
        emoji: "🔮"
    },
    {
        name: "Balanced Growth",
        description: "Increase health by 15 and mana by 12",
        effect: { maxHealth: 15, maxMana: 12 },
        emoji: "⚖️"
    },
    {
        name: "Spell Power",
        description: "Increase max mana by 20 and learn an extra spell",
        effect: { maxHealth: 0, maxMana: 20, extraSpell: true },
        emoji: "📜"
    },
    {
        name: "Vitality",
        description: "Increase max health by 25 and restore all health/mana",
        effect: { maxHealth: 25, maxMana: 0, fullRestore: true },
        emoji: "💪"
    },
    {
        name: "Arcane Mastery",
        description: "Increase max mana by 30 and reduce spell costs by 10%",
        effect: { maxHealth: 0, maxMana: 30, spellDiscount: true },
        emoji: "✨"
    }
];

// Level up player
function levelUpPlayer(userId) {
    const player = playerData[userId];
    const expNeeded = getExpForLevel(player.level);
    
    if (player.experience >= expNeeded) {
        player.experience -= expNeeded;
        player.level++;
        player.gold += player.level * 10;
        
        // Generate new random spell for this level
        if (player.class && player.level <= 7) {
            const newSpell = generateRandomSpell(player.class, player.level);
            if (newSpell) {
                player.spells.push(newSpell);
            }
        }
        
        savePlayerData();
        return true;
    }
    return false;
}

// Create class selection embed
function createClassSelectionEmbed() {
    const embed = new MessageEmbed()
        .setTitle('🎭 Choose Your Mage Class')
        .setDescription('Select your mage specialization. Each class has unique spells with random rarities!\n\n**Rarity System:**\n⚪ Common (50%)\n🟢 Uncommon (30%)\n🔵 Rare (15%)\n🟣 Epic (4%)\n🟡 Legendary (1%)')
        .setColor('#8B5CF6');

    for (const [classKey, classData] of Object.entries(mageClasses)) {
        embed.addFields({
            name: `${classData.name}`,
            value: `${classData.description}\n**Spell Types:** Damage, Healing, Shields, Effects`,
            inline: true
        });
    }

    return embed;
}

// Create class selection buttons
function createClassButtons() {
    const rows = [];
    const classKeys = Object.keys(mageClasses);
    
    // Split buttons into rows of 3 (Discord limit is 5 per row)
    for (let i = 0; i < classKeys.length; i += 3) {
        const row = new MessageActionRow();
        const rowClasses = classKeys.slice(i, i + 3);
        
        for (const classKey of rowClasses) {
            row.addComponents(
                new MessageButton()
                    .setCustomId(`class_${classKey}`)
                    .setLabel(mageClasses[classKey].name)
                    .setStyle('PRIMARY')
            );
        }
        
        rows.push(row);
    }
    
    return rows;
}

// Create level up choice buttons
function createLevelUpButtons() {
    const rows = [];
    
    // Split options into rows of 2 (since we have 6 options)
    for (let i = 0; i < levelUpOptions.length; i += 2) {
        const row = new MessageActionRow();
        const rowOptions = levelUpOptions.slice(i, i + 2);
        
        for (let j = 0; j < rowOptions.length; j++) {
            const option = rowOptions[j];
            const optionIndex = i + j;
            row.addComponents(
                new MessageButton()
                    .setCustomId(`levelup_${optionIndex}`)
                    .setLabel(`${option.emoji} ${option.name}`)
                    .setStyle('PRIMARY')
            );
        }
        
        rows.push(row);
    }
    
    return rows;
}

// Create level up choice embed
function createLevelUpEmbed() {
    const embed = new MessageEmbed()
        .setTitle('🎉 Level Up!')
        .setDescription('Choose your stat upgrade:')
        .setColor('#F59E0B');

    for (let i = 0; i < levelUpOptions.length; i++) {
        const option = levelUpOptions[i];
        embed.addFields({
            name: `${option.emoji} ${option.name}`,
            value: option.description,
            inline: true
        });
    }

    return embed;
}

// Create player stats embed
function createPlayerStatsEmbed(player, user) {
    const embed = new MessageEmbed()
        .setTitle(`🧙‍♂️ ${user.username}'s Mage Profile`)
        .setThumbnail(user.displayAvatarURL())
        .setColor('#10B981');

    const classInfo = player.class ? mageClasses[player.class] : null;
    const expNeeded = getExpForLevel(player.level);
    const expProgress = ((player.experience / expNeeded) * 100).toFixed(1);

    embed.addFields(
        { name: 'Level', value: `${player.level}`, inline: true },
        { name: 'Experience', value: `${player.experience}/${expNeeded} (${expProgress}%)`, inline: true },
        { name: 'Class', value: classInfo ? classInfo.name : 'None', inline: true },
        { name: 'Health', value: `${player.health}/${player.maxHealth}`, inline: true },
        { name: 'Mana', value: `${player.mana}/${player.maxMana}`, inline: true },
        { name: 'Gold', value: `${player.gold}`, inline: true },
        { name: 'PvP Record', value: `${player.pvpWins}W/${player.pvpLosses}L`, inline: true }
    );

    if (player.spells.length > 0) {
        const spellList = player.spells.map(spell => {
            const rarityEmoji = {
                common: '⚪',
                uncommon: '🟢', 
                rare: '🔵',
                epic: '🟣',
                legendary: '🟡'
            };
            return `${rarityEmoji[spell.rarity]} **${spell.name}** (${spell.damage > 0 ? `${spell.damage} damage` : spell.effect || 'Heal'} - ${spell.mana} mana)`;
        }).join('\n');
        
        embed.addFields({
            name: 'Learned Spells',
            value: spellList,
            inline: false
        });
    }

    return embed;
}

// Handle PvP combat
async function handlePvP(interaction, targetUser) {
    const attackerId = interaction.user.id;
    const defenderId = targetUser.id;
    
    if (attackerId === defenderId) {
        await interaction.reply({ content: "❌ You cannot fight yourself!", ephemeral: true });
        return;
    }

    const attacker = playerData[attackerId];
    const defender = playerData[defenderId];

    if (!attacker || !defender) {
        await interaction.reply({ content: "❌ Both players must be registered!", ephemeral: true });
        return;
    }

    if (attacker.level < 5 || defender.level < 5) {
        await interaction.reply({ content: "❌ Both players must be level 5 or higher to PvP!", ephemeral: true });
        return;
    }

    // Start combat
    const embed = new MessageEmbed()
        .setTitle('⚔️ PvP Combat Started!')
        .setDescription(`${interaction.user.username} challenges ${targetUser.username} to a mage duel!`)
        .setColor('#EF4444');

                    await interaction.reply({ embeds: [embed], ephemeral: true });

    // Simulate combat
    let round = 1;
    let attackerHealth = attacker.health;
    let defenderHealth = defender.health;
    let combatLog = [];

    while (attackerHealth > 0 && defenderHealth > 0 && round <= 10) {
        // Attacker's turn
        const attackerSpell = attacker.spells[Math.floor(Math.random() * attacker.spells.length)];
        const damage = Math.floor(attackerSpell.damage * (0.8 + Math.random() * 0.4));
        
        defenderHealth -= damage;
        combatLog.push(`**Round ${round}:** ${interaction.user.username} casts ${attackerSpell.name} for ${damage} damage!`);

        if (defenderHealth <= 0) break;

        // Defender's turn
        const defenderSpell = defender.spells[Math.floor(Math.random() * defender.spells.length)];
        const defenderDamage = Math.floor(defenderSpell.damage * (0.8 + Math.random() * 0.4));
        
        attackerHealth -= defenderDamage;
        combatLog.push(`**Round ${round}:** ${targetUser.username} casts ${defenderSpell.name} for ${defenderDamage} damage!`);

        round++;
    }

    // Determine winner
    const winner = attackerHealth > 0 ? interaction.user : targetUser;
    const loser = attackerHealth > 0 ? targetUser : interaction.user;

    // Update stats
    if (winner.id === attackerId) {
        attacker.pvpWins++;
        defender.pvpLosses++;
        // Check for resurrection scroll
        if (defender.resurrectionScroll) {
            defender.resurrectionScroll = false;
            defender.health = Math.floor(defender.maxHealth * 0.5);
        } else {
            // Reset loser to level 1
            defender.level = 1;
            defender.experience = 0;
            defender.health = defender.maxHealth = 100;
            defender.mana = defender.maxMana = 100;
            defender.gold = 0;
            defender.spells = [];
            defender.class = null;
            defender.inventory = {};
        }
    } else {
        defender.pvpWins++;
        attacker.pvpLosses++;
        // Check for resurrection scroll
        if (attacker.resurrectionScroll) {
            attacker.resurrectionScroll = false;
            attacker.health = Math.floor(attacker.maxHealth * 0.5);
        } else {
            // Reset loser to level 1
            attacker.level = 1;
            attacker.experience = 0;
            attacker.health = attacker.maxHealth = 100;
            attacker.mana = attacker.maxMana = 100;
            attacker.gold = 0;
            attacker.spells = [];
            attacker.class = null;
            attacker.inventory = {};
        }
    }

    savePlayerData();

    // Create combat result embed
    const resultEmbed = new MessageEmbed()
        .setTitle('🏆 Combat Results')
        .setDescription(`${winner.username} wins the duel!`)
        .setColor('#10B981');

    if (combatLog.length > 0) {
        resultEmbed.addFields({
            name: 'Combat Log',
            value: combatLog.slice(-6).join('\n'),
            inline: false
        });
    }

    resultEmbed.addFields({
        name: 'Final Health',
        value: `${interaction.user.username}: ${Math.max(0, attackerHealth)} HP\n${targetUser.username}: ${Math.max(0, defenderHealth)} HP`,
        inline: true
    });

    if (loser.id === attackerId || loser.id === defenderId) {
        resultEmbed.addFields({
            name: '💀 Defeat Penalty',
            value: `${loser.username} has been reset to level 1!`,
            inline: true
        });
    }

    await interaction.followUp({ embeds: [resultEmbed], ephemeral: true });
}

// Bot event handlers
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    loadPlayerData();
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() && !interaction.isButton()) return;

    const userId = interaction.user.id;
    const player = initializePlayer(userId);

    if (interaction.isCommand()) {
        const { commandName } = interaction;

        switch (commandName) {
            case 'start':
                if (player.class) {
                    await interaction.reply({ content: "❌ You have already started your journey!", ephemeral: true });
                    return;
                }
                
                const embed = createClassSelectionEmbed();
                const buttonRows = createClassButtons();
                
                await interaction.reply({ embeds: [embed], components: buttonRows, ephemeral: true });
                break;

            case 'profile':
                const statsEmbed = createPlayerStatsEmbed(player, interaction.user);
                await interaction.reply({ embeds: [statsEmbed], ephemeral: true });
                break;

            case 'adventure':
                if (!player.class) {
                    await interaction.reply({ content: "❌ You must choose a class first! Use `/start`", ephemeral: true });
                    return;
                }

                // Get random encounter
                const encounter = getRandomEncounter();
                
                if (encounter.type === 'peaceful') {
                    // Peaceful encounter - automatic success
                    player.experience += encounter.exp;
                    player.gold += encounter.gold;
                    player.health = Math.min(player.maxHealth, player.health + encounter.health);
                    player.mana = Math.min(player.maxMana, player.mana + encounter.mana);
                    
                                    const leveledUp = levelUpPlayer(userId);
                
                const adventureEmbed = new MessageEmbed()
                    .setTitle(`🌟 ${encounter.name}`)
                    .setDescription(encounter.description)
                    .setColor('#10B981')
                    .addFields(
                        { name: 'Experience Gained', value: `+${encounter.exp}`, inline: true },
                        { name: 'Gold Found', value: `+${encounter.gold}`, inline: true },
                        { name: 'Health Restored', value: encounter.health > 0 ? `+${encounter.health}` : 'None', inline: true },
                        { name: 'Mana Restored', value: encounter.mana > 0 ? `+${encounter.mana}` : 'None', inline: true }
                    );

                if (leveledUp) {
                    // Send level up choice
                    const levelUpEmbed = createLevelUpEmbed();
                    const levelUpButtons = createLevelUpButtons();
                    
                    await interaction.reply({ embeds: [adventureEmbed], ephemeral: true });
                    await interaction.followUp({ embeds: [levelUpEmbed], components: levelUpButtons, ephemeral: true });
                    return; // Don't save data yet, wait for choice
                }

                    await interaction.reply({ embeds: [adventureEmbed], ephemeral: true });
                } else {
                    // Dangerous/Deadly encounter - combat required
                    const combatResult = await simulateCombat(player, encounter, interaction);
                    
                    if (combatResult.victory) {
                        // Victory!
                        player.experience += encounter.exp;
                        player.gold += encounter.gold;
                        player.health = Math.max(1, combatResult.playerHealth); // Don't let health go below 1
                        
                        const leveledUp = levelUpPlayer(userId);
                        
                        const victoryEmbed = new MessageEmbed()
                            .setTitle(`⚔️ Victory! - ${encounter.name}`)
                            .setDescription(`You defeated the ${encounter.name}!`)
                            .setColor('#10B981')
                            .addFields(
                                { name: 'Experience Gained', value: `+${encounter.exp}`, inline: true },
                                { name: 'Gold Found', value: `+${encounter.gold}`, inline: true },
                                { name: 'Health Remaining', value: `${combatResult.playerHealth}`, inline: true }
                            );

                        if (combatResult.combatLog.length > 0) {
                            victoryEmbed.addFields({
                                name: 'Combat Log',
                                value: combatResult.combatLog.slice(-6).join('\n'),
                                inline: false
                            });
                        }

                        if (leveledUp) {
                            // Send level up choice
                            const levelUpEmbed = createLevelUpEmbed();
                            const levelUpButtons = createLevelUpButtons();
                            
                                                    await interaction.reply({ embeds: [victoryEmbed], ephemeral: true });
                        await interaction.followUp({ embeds: [levelUpEmbed], components: levelUpButtons, ephemeral: true });
                        return; // Don't save data yet, wait for choice
                        }

                        await interaction.reply({ embeds: [victoryEmbed], ephemeral: true });
                    } else {
                        // Defeat - player dies and resets
                        const defeatEmbed = new MessageEmbed()
                            .setTitle(`💀 Defeat - ${encounter.name}`)
                            .setDescription(`You were defeated by the ${encounter.name}!`)
                            .setColor('#EF4444')
                            .addFields(
                                { name: 'Final Health', value: `${combatResult.playerHealth}`, inline: true },
                                { name: 'Monster Health Remaining', value: `${combatResult.monsterHealth}`, inline: true }
                            );

                        if (combatResult.combatLog.length > 0) {
                            defeatEmbed.addFields({
                                name: 'Combat Log',
                                value: combatResult.combatLog.slice(-6).join('\n'),
                                inline: false
                            });
                        }

                        await interaction.reply({ embeds: [defeatEmbed], ephemeral: true });

                        // Check for resurrection scroll
                        if (player.resurrectionScroll) {
                            player.resurrectionScroll = false;
                            player.health = Math.floor(player.maxHealth * 0.5); // Revive with 50% health
                            
                            const resurrectionEmbed = new MessageEmbed()
                                .setTitle('⚰️ Resurrection!')
                                .setDescription('Your resurrection scroll saved you from death! You have been revived with 50% health.')
                                .setColor('#F59E0B')
                                .addFields(
                                    { name: 'Health Restored', value: `${player.health}/${player.maxHealth}`, inline: true }
                                );
                            
                            await interaction.followUp({ embeds: [resurrectionEmbed], ephemeral: true });
                        } else {
                            // Reset player to level 1
                            player.level = 1;
                            player.experience = 0;
                            player.health = player.maxHealth = 100;
                            player.mana = player.maxMana = 100;
                            player.gold = 0;
                            player.spells = [];
                            player.class = null;
                            player.inventory = {};
                            
                            const resetEmbed = new MessageEmbed()
                                .setTitle('🔄 Character Reset')
                                .setDescription('You have been reset to level 1. Use `/start` to choose a new class and begin again!')
                                .setColor('#F59E0B');
                            
                            await interaction.followUp({ embeds: [resetEmbed], ephemeral: true });
                        }
                    }
                }
                
                savePlayerData();
                break;

            case 'pvp':
                if (player.level < 5) {
                    await interaction.reply({ content: "❌ You must be level 5 or higher to participate in PvP!", ephemeral: true });
                    return;
                }

                const targetUser = interaction.options.getUser('target');
                if (!targetUser) {
                    await interaction.reply({ content: "❌ Please specify a target user!", ephemeral: true });
                    return;
                }

                await handlePvP(interaction, targetUser);
                break;

            case 'spells':
                if (!player.class) {
                    await interaction.reply({ content: "❌ You must choose a class first! Use `/start`", ephemeral: true });
                    return;
                }

                if (player.spells.length === 0) {
                    const spellsEmbed = new MessageEmbed()
                        .setTitle(`📚 ${mageClasses[player.class].name} Spells`)
                        .setDescription("You haven't learned any spells yet! Go on adventures to level up and gain spells.")
                        .setColor('#8B5CF6');
                    await interaction.reply({ embeds: [spellsEmbed], ephemeral: true });
                    return;
                }

                const spellList = player.spells.map(spell => {
                    const rarityEmoji = {
                        common: '⚪',
                        uncommon: '🟢', 
                        rare: '🔵',
                        epic: '🟣',
                        legendary: '🟡'
                    };
                    const effectText = spell.effect ? ` (${spell.effect})` : '';
                    return `${rarityEmoji[spell.rarity]} **${spell.name}** - ${spell.damage > 0 ? `${spell.damage} damage` : 'Heal'}${effectText} - ${spell.mana} mana`;
                }).join('\n');

                const spellsEmbed = new MessageEmbed()
                    .setTitle(`📚 ${mageClasses[player.class].name} Spells`)
                    .setDescription(spellList)
                    .setColor('#8B5CF6');

                await interaction.reply({ embeds: [spellsEmbed], ephemeral: true });
                break;

            case 'status':
                if (!player.class) {
                    await interaction.reply({ content: "❌ You must choose a class first! Use `/start`", ephemeral: true });
                    return;
                }

                const healthPercentage = ((player.health / player.maxHealth) * 100).toFixed(1);
                const manaPercentage = ((player.mana / player.maxMana) * 100).toFixed(1);
                
                const statusEmbed = new MessageEmbed()
                    .setTitle(`💚 ${interaction.user.username}'s Status`)
                    .setColor('#10B981')
                    .addFields(
                        { name: 'Health', value: `${player.health}/${player.maxHealth} (${healthPercentage}%)`, inline: true },
                        { name: 'Mana', value: `${player.mana}/${player.maxMana} (${manaPercentage}%)`, inline: true },
                        { name: 'Class', value: mageClasses[player.class].name, inline: true },
                        { name: 'Level', value: `${player.level}`, inline: true },
                        { name: 'Gold', value: `${player.gold}`, inline: true },
                        { name: 'Spells Known', value: `${player.spells.length}`, inline: true }
                    );

                // Add health bar visualization
                const healthBars = Math.floor(player.health / player.maxHealth * 10);
                const manaBars = Math.floor(player.mana / player.maxMana * 10);
                
                statusEmbed.addFields({
                    name: 'Health Bar',
                    value: '🟥'.repeat(healthBars) + '⬜'.repeat(10 - healthBars),
                    inline: false
                });

                statusEmbed.addFields({
                    name: 'Mana Bar',
                    value: '🟦'.repeat(manaBars) + '⬜'.repeat(10 - manaBars),
                    inline: false
                });

                await interaction.reply({ embeds: [statusEmbed], ephemeral: true });
                break;

            case 'shop':
                if (!player.class) {
                    await interaction.reply({ content: "❌ You must choose a class first! Use `/start`", ephemeral: true });
                    return;
                }

                const shopEmbed = new MessageEmbed()
                    .setTitle('🏪 Magic Shop')
                    .setDescription('Welcome to the Magic Shop! Use `/buy <item>` to purchase items.')
                    .setColor('#8B5CF6');

                for (const [itemKey, item] of Object.entries(shopItems)) {
                    const canAfford = player.gold >= item.cost;
                    const status = canAfford ? '✅' : '❌';
                    shopEmbed.addFields({
                        name: `${item.emoji} ${item.name} - ${item.cost} gold ${status}`,
                        value: item.description,
                        inline: true
                    });
                }

                shopEmbed.addFields({
                    name: 'Your Gold',
                    value: `${player.gold} gold`,
                    inline: false
                });

                await interaction.reply({ embeds: [shopEmbed], ephemeral: true });
                break;

            case 'buy':
                if (!player.class) {
                    await interaction.reply({ content: "❌ You must choose a class first! Use `/start`", ephemeral: true });
                    return;
                }

                const itemToBuy = interaction.options.getString('item');
                const item = shopItems[itemToBuy];

                if (!item) {
                    await interaction.reply({ content: "❌ Invalid item!", ephemeral: true });
                    return;
                }

                if (player.gold < item.cost) {
                    await interaction.reply({ content: `❌ You don't have enough gold! You need ${item.cost} gold but have ${player.gold} gold.`, ephemeral: true });
                    return;
                }

                // Handle different item types
                if (item.effect.spellScroll) {
                    // Generate random spell for current level or next level
                    const spellLevel = Math.min(player.level + 1, 7);
                    const newSpell = generateRandomSpell(player.class, spellLevel);
                    if (newSpell) {
                        player.spells.push(newSpell);
                        player.gold -= item.cost;
                        
                        const buyEmbed = new MessageEmbed()
                            .setTitle('📜 Spell Scroll Purchased!')
                            .setDescription(`You learned a new spell: ${newSpell.name}!`)
                            .setColor('#10B981')
                            .addFields(
                                { name: 'Spell', value: newSpell.name, inline: true },
                                { name: 'Damage', value: newSpell.damage > 0 ? `${newSpell.damage}` : 'Heal', inline: true },
                                { name: 'Mana Cost', value: `${newSpell.mana}`, inline: true },
                                { name: 'Gold Spent', value: `${item.cost}`, inline: true },
                                { name: 'Gold Remaining', value: `${player.gold}`, inline: true }
                            );
                        
                        await interaction.reply({ embeds: [buyEmbed], ephemeral: true });
                    }
                } else if (item.effect.resurrection) {
                    player.resurrectionScroll = true;
                    player.gold -= item.cost;
                    
                    const buyEmbed = new MessageEmbed()
                        .setTitle('⚰️ Resurrection Scroll Purchased!')
                        .setDescription('You now have a resurrection scroll! If you die, you will be revived once.')
                        .setColor('#10B981')
                        .addFields(
                            { name: 'Gold Spent', value: `${item.cost}`, inline: true },
                            { name: 'Gold Remaining', value: `${player.gold}`, inline: true }
                        );
                    
                    await interaction.reply({ embeds: [buyEmbed], ephemeral: true });
                } else {
                    // Regular consumable or stat boost
                    if (item.effect.maxHealth) {
                        player.maxHealth += item.effect.maxHealth;
                        player.health += item.effect.maxHealth;
                    }
                    if (item.effect.maxMana) {
                        player.maxMana += item.effect.maxMana;
                        player.mana += item.effect.maxMana;
                    }
                    
                    // Add to inventory if it's a consumable
                    if (item.effect.health || item.effect.mana) {
                        if (!player.inventory[itemToBuy]) {
                            player.inventory[itemToBuy] = 0;
                        }
                        player.inventory[itemToBuy]++;
                    }
                    
                    player.gold -= item.cost;
                    
                    const buyEmbed = new MessageEmbed()
                        .setTitle(`${item.emoji} ${item.name} Purchased!`)
                        .setDescription(item.description)
                        .setColor('#10B981')
                        .addFields(
                            { name: 'Gold Spent', value: `${item.cost}`, inline: true },
                            { name: 'Gold Remaining', value: `${player.gold}`, inline: true }
                        );
                    
                    await interaction.reply({ embeds: [buyEmbed], ephemeral: true });
                }
                
                savePlayerData();
                break;

            case 'use':
                if (!player.class) {
                    await interaction.reply({ content: "❌ You must choose a class first! Use `/start`", ephemeral: true });
                    return;
                }

                const itemToUse = interaction.options.getString('item');
                const useItem = shopItems[itemToUse];

                if (!useItem) {
                    await interaction.reply({ content: "❌ Invalid item!", ephemeral: true });
                    return;
                }

                if (!player.inventory[itemToUse] || player.inventory[itemToUse] <= 0) {
                    await interaction.reply({ content: "❌ You don't have this item in your inventory!", ephemeral: true });
                    return;
                }

                // Use the item
                if (useItem.effect.health) {
                    player.health = Math.min(player.maxHealth, player.health + useItem.effect.health);
                }
                if (useItem.effect.mana) {
                    player.mana = Math.min(player.maxMana, player.mana + useItem.effect.mana);
                }

                player.inventory[itemToUse]--;
                if (player.inventory[itemToUse] <= 0) {
                    delete player.inventory[itemToUse];
                }

                const useEmbed = new MessageEmbed()
                    .setTitle(`${useItem.emoji} ${useItem.name} Used!`)
                    .setDescription(useItem.description)
                    .setColor('#10B981')
                    .addFields(
                        { name: 'Current Health', value: `${player.health}/${player.maxHealth}`, inline: true },
                        { name: 'Current Mana', value: `${player.mana}/${player.maxMana}`, inline: true },
                        { name: 'Remaining', value: player.inventory[itemToUse] || 0, inline: true }
                    );

                await interaction.reply({ embeds: [useEmbed], ephemeral: true });
                savePlayerData();
                break;

            case 'levelup':
                if (!player.class) {
                    await interaction.reply({ content: "❌ You must choose a class first! Use `/start`", ephemeral: true });
                    return;
                }

                const expNeeded = getExpForLevel(player.level);
                const expProgress = ((player.experience / expNeeded) * 100).toFixed(1);

                const levelUpInfoEmbed = new MessageEmbed()
                    .setTitle('📈 Level Up Information')
                    .setDescription('When you level up, you can choose from these stat upgrades:')
                    .setColor('#F59E0B')
                    .addFields(
                        { name: 'Current Level', value: `${player.level}`, inline: true },
                        { name: 'Experience Progress', value: `${player.experience}/${expNeeded} (${expProgress}%)`, inline: true }
                    );

                for (let i = 0; i < levelUpOptions.length; i++) {
                    const option = levelUpOptions[i];
                    levelUpInfoEmbed.addFields({
                        name: `${option.emoji} ${option.name}`,
                        value: option.description,
                        inline: true
                    });
                }

                await interaction.reply({ embeds: [levelUpInfoEmbed], ephemeral: true });
                break;

            case 'reset':
                if (!player.class) {
                    await interaction.reply({ content: "❌ You haven't started your journey yet! Use `/start`", ephemeral: true });
                    return;
                }

                // Reset player to level 1
                player.level = 1;
                player.experience = 0;
                player.health = player.maxHealth = 100;
                player.mana = player.maxMana = 100;
                player.gold = 0;
                player.spells = [];
                player.class = null;
                player.inventory = {};
                player.resurrectionScroll = false;
                player.pvpWins = 0;
                player.pvpLosses = 0;
                
                savePlayerData();

                const resetEmbed = new MessageEmbed()
                    .setTitle('🔄 Character Reset')
                    .setDescription('Your character has been reset to level 1. Use `/start` to choose a new class and begin again!')
                    .setColor('#F59E0B')
                    .addFields(
                        { name: 'Level', value: '1', inline: true },
                        { name: 'Health', value: '100/100', inline: true },
                        { name: 'Mana', value: '100/100', inline: true },
                        { name: 'Gold', value: '0', inline: true },
                        { name: 'Spells', value: '0', inline: true },
                        { name: 'PvP Record', value: '0W/0L', inline: true }
                    );

                await interaction.reply({ embeds: [resetEmbed], ephemeral: true });
                break;

            case 'help':
                const helpEmbed = new MessageEmbed()
                    .setTitle('🧙‍♂️ Mage RPG - Command List')
                    .setDescription('Welcome to the Mage RPG! Here are all available commands:')
                    .setColor('#8B5CF6')
                    .addFields(
                        { 
                            name: '🎭 Getting Started', 
                            value: '`/start` - Begin your journey and choose your mage class\n`/help` - Show this command list', 
                            inline: false 
                        },
                        { 
                            name: '📊 Character Info', 
                            value: '`/profile` - View your character stats and spells\n`/status` - Check your current health and mana\n`/spells` - View your learned spells\n`/levelup` - See level up information and stat upgrades', 
                            inline: false 
                        },
                        { 
                            name: '⚔️ Gameplay', 
                            value: '`/adventure` - Go on adventures to gain experience and gold\n`/pvp <target>` - Challenge another player to a duel (level 5+)', 
                            inline: false 
                        },
                        { 
                            name: '🏪 Shop & Items', 
                            value: '`/shop` - View the magic shop\n`/buy <item>` - Purchase items from the shop\n`/use <item>` - Use items from your inventory', 
                            inline: false 
                        },
                        { 
                            name: '🔄 Management', 
                            value: '`/reset` - Reset your character to level 1 (WARNING: Deletes all progress!)', 
                            inline: false 
                        }
                    )
                    .addFields({
                        name: '📚 Game Features',
                        value: '• **6 Mage Classes**: Fire, Water, Earth, Wind, Light, Dark\n• **Random Spells**: Learn spells with different rarities (Common to Legendary)\n• **Level Up System**: Choose stat upgrades when you level up\n• **Random Encounters**: Peaceful, dangerous, and deadly adventures\n• **PvP Combat**: Challenge other players at level 5+\n• **Shop System**: Buy potions, stat boosts, and special items\n• **Death System**: Resurrection scrolls or reset to level 1',
                        inline: false
                    })
                    .setFooter({ text: 'Use /start to begin your mage journey!' });

                await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
                break;
        }
    }

    if (interaction.isButton()) {
        const { customId } = interaction;

        if (customId.startsWith('class_')) {
            const selectedClass = customId.replace('class_', '');
            
            if (player.class) {
                await interaction.reply({ content: "❌ You have already chosen a class!", ephemeral: true });
                return;
            }

            player.class = selectedClass;
            // Generate random starting spell
            const startingSpell = generateRandomSpell(selectedClass, 1);
            player.spells = startingSpell ? [startingSpell] : [];
            
            savePlayerData();

            const classEmbed = new MessageEmbed()
                .setTitle('🎭 Class Chosen!')
                .setDescription(`You are now a ${mageClasses[selectedClass].name}!`)
                .addFields({
                    name: 'Starting Spell',
                    value: player.spells.length > 0 ? 
                        `${player.spells[0].name} (${player.spells[0].damage > 0 ? `${player.spells[0].damage} damage` : 'Heal'} - ${player.spells[0].mana} mana)` : 
                        'No spells learned yet',
                    inline: false
                })
                .setColor('#10B981');

            await interaction.update({ embeds: [classEmbed], components: [] });
        }

        if (customId.startsWith('levelup_')) {
            const optionIndex = parseInt(customId.replace('levelup_', ''));
            const selectedOption = levelUpOptions[optionIndex];
            
            if (!selectedOption) {
                await interaction.reply({ content: "❌ Invalid level up option!", ephemeral: true });
                return;
            }

            // Apply the selected upgrade
            if (selectedOption.effect.maxHealth) {
                player.maxHealth += selectedOption.effect.maxHealth;
                player.health += selectedOption.effect.maxHealth;
            }
            if (selectedOption.effect.maxMana) {
                player.maxMana += selectedOption.effect.maxMana;
                player.mana += selectedOption.effect.maxMana;
            }
            if (selectedOption.effect.fullRestore) {
                player.health = player.maxHealth;
                player.mana = player.maxMana;
            }
            if (selectedOption.effect.extraSpell && player.class) {
                // Generate an extra random spell for current level
                const extraSpell = generateRandomSpell(player.class, player.level);
                if (extraSpell) {
                    player.spells.push(extraSpell);
                }
            }

            savePlayerData();

            const levelUpResultEmbed = new MessageEmbed()
                .setTitle(`${selectedOption.emoji} ${selectedOption.name} Chosen!`)
                .setDescription(`You are now level ${player.level}!`)
                .setColor('#10B981')
                .addFields(
                    { name: 'New Stats', value: `Health: ${player.health}/${player.maxHealth}\nMana: ${player.mana}/${player.maxMana}`, inline: true },
                    { name: 'Spells Known', value: `${player.spells.length}`, inline: true }
                );

            if (selectedOption.effect.extraSpell && player.spells.length > 0) {
                const latestSpell = player.spells[player.spells.length - 1];
                levelUpResultEmbed.addFields({
                    name: 'Extra Spell Learned',
                    value: `${latestSpell.name} (${latestSpell.damage > 0 ? `${latestSpell.damage} damage` : 'Heal'} - ${latestSpell.mana} mana)`,
                    inline: false
                });
            }

            await interaction.update({ embeds: [levelUpResultEmbed], components: [] });
        }
    }
});

// Login
client.login(config.token);
