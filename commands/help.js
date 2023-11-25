const { EmbedBuilder } = require('discord.js');

function helpCommand(message) {
    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('BabarBot')
      .setURL('https://github.com/DylanHughes1/BarbaBot')
      .setAuthor({ name: 'Dylan Hughes' })
      .setDescription('Bienvenidos al bot de Barbakahn. Para reproducir un sonido, escriba "!play" y el nombre del sonido. Para ver la lista de sonidos, escriba "!sounds". ')
      .setThumbnail('https://pm1.aminoapps.com/6426/ff34f4317d56bd4448a57c95db21b5718d7663dd_00.jpg')
      .setFooter({ text: 'Saludos Hijos de Odin 🍻' });
    message.channel.send({ embeds: [exampleEmbed] });
  }
  
  module.exports = helpCommand;
  