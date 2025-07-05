const config = require('./config.json');

const clientId = config.clientId;
const permissions = [
    'SEND_MESSAGES',
    'USE_SLASH_COMMANDS',
    'READ_MESSAGE_HISTORY',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'USE_EXTERNAL_EMOJIS',
    'ADD_REACTIONS'
];

const permissionBits = permissions.map(perm => {
    const permissionMap = {
        'SEND_MESSAGES': 0x0000000000000400,
        'USE_SLASH_COMMANDS': 0x0000000000008000,
        'READ_MESSAGE_HISTORY': 0x0000000000004000,
        'EMBED_LINKS': 0x0000000000004000,
        'ATTACH_FILES': 0x0000000000008000,
        'USE_EXTERNAL_EMOJIS': 0x0000000000004000,
        'ADD_REACTIONS': 0x0000000000000040
    };
    return permissionMap[perm] || 0;
}).reduce((a, b) => a | b, 0);

const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissionBits}&scope=bot%20applications.commands`;

console.log('=== Discord Bot Invite URL ===');
console.log(inviteUrl);
console.log('\n=== Required Permissions ===');
console.log(permissions.join(', '));
console.log('\n=== Instructions ===');
console.log('1. Copy the URL above');
console.log('2. Open it in your browser');
console.log('3. Select your Discord server');
console.log('4. Authorize the bot');
console.log('5. The bot should now appear in your server');
console.log('6. Try typing /start to test the commands'); 