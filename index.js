const { Client, GatewayIntentBits } = require('discord.js');
const { createAudioPlayer } = require('@discordjs/voice');
const soundMappings = require('./soundMappings.js');
const playCommand = require('./commands/play');
const soundsCommand = require('./commands/sounds');
const helpCommand = require('./commands/help');
require('dotenv').config();
const express = require('express')
const app = express();
const port = 3000

app.get('/', (req, res) => res.send('Bot is now running!!'))

app.listen(port, () =>
  console.log(`Your app is listening a http://localhost:${port}`)
);


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const audioPlayer = createAudioPlayer();
const queues = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!play')) {
    playCommand(message, queues, soundMappings, audioPlayer);
  }

  if (message.content === '!sounds') {
    soundsCommand(message, soundMappings);
  }

  if (message.content === '!help') {
    helpCommand(message);
  }
});

client.login(process.env.BOT_TOKEN);

