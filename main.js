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

// Level up player
function levelUpPlayer(userId) {
    const player = playerData[userId];
    const expNeeded = getExpForLevel(player.level);
    
    if (player.experience >= expNeeded) {
        player.experience -= expNeeded;
        player.level++;
        player.maxHealth += 20;
        player.health = player.maxHealth;
        player.maxMana += 15;
        player.mana = player.maxMana;
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

    await interaction.reply({ embeds: [embed] });

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
        // Reset loser to level 1
        defender.level = 1;
        defender.experience = 0;
        defender.health = defender.maxHealth = 100;
        defender.mana = defender.maxMana = 100;
        defender.gold = 0;
        defender.spells = [];
        defender.class = null;
    } else {
        defender.pvpWins++;
        attacker.pvpLosses++;
        // Reset loser to level 1
        attacker.level = 1;
        attacker.experience = 0;
        attacker.health = attacker.maxHealth = 100;
        attacker.mana = attacker.maxMana = 100;
        attacker.gold = 0;
        attacker.spells = [];
        attacker.class = null;
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

    await interaction.followUp({ embeds: [resultEmbed] });
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
                
                await interaction.reply({ embeds: [embed], components: buttonRows });
                break;

            case 'profile':
                const statsEmbed = createPlayerStatsEmbed(player, interaction.user);
                await interaction.reply({ embeds: [statsEmbed] });
                break;

            case 'adventure':
                if (!player.class) {
                    await interaction.reply({ content: "❌ You must choose a class first! Use `/start`", ephemeral: true });
                    return;
                }

                const expGained = Math.floor(Math.random() * 20) + 10;
                const goldGained = Math.floor(Math.random() * 15) + 5;
                
                player.experience += expGained;
                player.gold += goldGained;
                
                const leveledUp = levelUpPlayer(userId);
                
                const adventureEmbed = new MessageEmbed()
                    .setTitle('🗺️ Adventure Complete!')
                    .setDescription(`You explored the magical realm and gained experience!`)
                    .setColor('#F59E0B')
                    .addFields(
                        { name: 'Experience Gained', value: `+${expGained}`, inline: true },
                        { name: 'Gold Found', value: `+${goldGained}`, inline: true }
                    );

                if (leveledUp) {
                    adventureEmbed.addFields({
                        name: '🎉 Level Up!',
                        value: `You are now level ${player.level}!`,
                        inline: false
                    });
                }

                await interaction.reply({ embeds: [adventureEmbed] });
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
                    await interaction.reply({ embeds: [spellsEmbed] });
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

                await interaction.reply({ embeds: [spellsEmbed] });
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
    }
});

// Login
client.login(config.token);
