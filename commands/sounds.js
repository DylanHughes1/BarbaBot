const { EmbedBuilder } = require('discord.js');

function soundsCommand(message, soundMappings) {
    if (message.content === '!sounds') {
        const soundNames = Object.keys(soundMappings).join(', ');
    
        const embed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Lista de Sonidos')
          .setDescription(soundNames)
          .setThumbnail('https://pm1.aminoapps.com/6426/ff34f4317d56bd4448a57c95db21b5718d7663dd_00.jpg');
    
        message.channel.send({ embeds: [embed] });
      }
}

module.exports = soundsCommand;
