const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
const soundMappings = require('./soundMappings.js'); 
require('dotenv').config();


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const audioPlayer = createAudioPlayer();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!play')) {
    // Obtiene el canal de voz del autor del mensaje
    const voiceChannel = message.member.voice.channel;

    if (voiceChannel) {
      // Conéctate al canal de voz
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      // Obtiene la palabra del comando
      const command = message.content.split(' ')[1];

      // Verifica si hay una ruta de sonido asociada a la palabra
      if (soundMappings[command]) {
        const soundPath = soundMappings[command];

        try {
          const audioResource = createAudioResource(soundPath);
          audioPlayer.play(audioResource);
          connection.subscribe(audioPlayer);
        } catch (error) {
          console.error('Error al reproducir el sonido:', error);
        }
      } else {
        message.reply('Cuando vemos que no es ninguna novedad que escriban mal el comando');
      }
    } else {
      message.reply('Debes estar en un canal de voz para usar este comando');
    }
  }

  if (message.content === '!sounds') {
    const soundNames = Object.keys(soundMappings).join(', ');

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Lista de Sonidos')
      .setDescription(soundNames)
      .setThumbnail('https://pm1.aminoapps.com/6426/ff34f4317d56bd4448a57c95db21b5718d7663dd_00.jpg')

    message.channel.send({ embeds: [embed] });

  }

  if (message.content === '!help') {
    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('BabarBot')
      .setURL('https://github.com/DylanHughes1')
      .setAuthor({ name: 'Dylan Hughes' })
      .setDescription('Bienvenidos al bot de Barbakahn. Para reproducir un sonido, escriba "!play" y el nombre del sonido. Para ver la lista de sonidos, escriba "!sounds". ')
      .setThumbnail('https://pm1.aminoapps.com/6426/ff34f4317d56bd4448a57c95db21b5718d7663dd_00.jpg')
      .setFooter({ text: 'Saludos Hijos de Odin 🍻' });
    message.channel.send({ embeds: [exampleEmbed] });
  }
});

client.login(process.env.BOT_TOKEN);

