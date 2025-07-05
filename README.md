# Discord Mage Game Bot

A Discord bot RPG game where players progress as mages, choose specializations, learn spells, and engage in PvP combat!

## 🎮 Game Features

### Mage Classes
- **Fire Mage**: Masters of destructive flame magic
- **Water Mage**: Controllers of healing and ice magic  
- **Earth Mage**: Defenders with powerful earth magic
- **Wind Mage**: Swift and agile air magic users
- **Light Mage**: Holy magic wielders with healing powers
- **Dark Mage**: Masters of shadow and necromancy

### Progression System
- Start at level 1 and gain experience through adventures
- Choose your mage class with unique spells
- Learn new spells as you level up
- PvP combat available at level 5+
- Defeat penalty: Reset to level 1 if you lose in PvP

### Commands
- `/start` - Begin your journey and choose your class
- `/profile` - View your mage stats and progress
- `/adventure` - Go on adventures to gain XP and gold
- `/pvp @user` - Challenge another player to a duel (Level 5+)
- `/spells` - View your available spells

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- A Discord bot token

### 1. Create a Discord Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Copy the bot token and client ID

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure the Bot
1. Edit `config.json`:
   - Replace `YOUR_DISCORD_BOT_TOKEN_HERE` with your bot token
   - Replace `YOUR_DISCORD_CLIENT_ID_HERE` with your client ID

### 4. Invite Bot to Server
1. Go to OAuth2 > URL Generator in Discord Developer Portal
2. Select scopes: `bot` and `applications.commands`
3. Select bot permissions: `Send Messages`, `Use Slash Commands`, `Read Message History`
4. Use the generated URL to invite the bot to your server

### 5. Deploy Commands
```bash
node deploy-commands.js
```

### 6. Run the Bot
```bash
npm start
```

## 🎯 How to Play

1. **Start Your Journey**: Use `/start` to begin and choose your mage class
2. **Adventure**: Use `/adventure` to gain experience and gold
3. **Level Up**: Gain enough XP to level up and unlock new spells
4. **PvP**: At level 5+, challenge other players with `/pvp @user`
5. **Risk**: If you lose in PvP, you restart at level 1!

## 📊 Game Mechanics

### Experience System
- Each level requires `level * 100` experience points
- Adventures give 10-30 XP and 5-20 gold
- Leveling up increases health, mana, and grants gold

### Spell System
- Each class has 4 unique spells
- Spells unlock at different levels (1, 2, 3, 4, 5, 6, 7)
- Spells have different damage values and mana costs
- Some spells have special effects (healing, shields, etc.)

### PvP Combat
- Turn-based combat system
- Random spell selection from learned spells
- Damage varies by ±20% for unpredictability
- Loser is reset to level 1 with no class or spells

## 🛠️ Technical Details

- Built with Discord.js v14
- Data persistence using JSON files
- Slash command system
- Interactive buttons for class selection
- Rich embeds for game information

## 📝 File Structure
```
discordGame/
├── main.js              # Main bot file
├── deploy-commands.js   # Command registration
├── config.json          # Configuration
├── package.json         # Dependencies
├── playerData.json      # Player data (auto-generated)
└── README.md           # This file
```

## 🔧 Customization

You can easily customize the game by modifying:
- Spell damage and mana costs in `main.js`
- Experience requirements in the `getExpForLevel` function
- New mage classes by adding to the `mageClasses` object
- PvP mechanics in the `handlePvP` function

## 🐛 Troubleshooting

- **Bot not responding**: Check if the bot token is correct and the bot is online
- **Commands not working**: Make sure you've run `deploy-commands.js` and the bot has proper permissions
- **Data not saving**: Check file permissions for `playerData.json`

## 📄 License

MIT License - feel free to modify and distribute! # magebot
