const { createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');


function playCommand(message, queues, soundMappings, audioPlayer) {

  const voiceChannel = message.member.voice.channel;

  if (voiceChannel) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const command = message.content.split(' ')[1];

    if (soundMappings[command]) {
      const soundPath = soundMappings[command];

      let queue = queues.get(message.guild.id);

      if (!queue) {
        queue = [];
        queues.set(message.guild.id, queue);

        audioPlayer.on(AudioPlayerStatus.Idle, () => {
          const nextSound = queue.shift();
          if (nextSound) {
            audioPlayer.play(nextSound);
          }
        });
      }

      const audioResource = createAudioResource(soundPath);
      queue.push(audioResource);

      if (audioPlayer.state.status !== AudioPlayerStatus.Playing) {
        audioPlayer.play(queue.shift());
        connection.subscribe(audioPlayer);

        // Start inactivity timer
        let inactivityTimer = setTimeout(() => {
          if (audioPlayer.state.status === AudioPlayerStatus.Idle) {
            connection.disconnect();
            console.log('Disconnecting bot due to inactivity');
          }
        }, 60000); // Disconnect after 60 seconds (1 minute)

        // Reset inactivity timer on activity (e.g., playing, pausing, queueing)
        audioPlayer.on(AudioPlayerStatus.Playing, () => {
          clearTimeout(inactivityTimer);
          inactivityTimer = setTimeout(() => {
            if (audioPlayer.state.status === AudioPlayerStatus.Idle) {
              connection.disconnect();
              console.log('Disconnecting bot due to inactivity');
            }
          }, 60000);
        });
        audioPlayer.on(AudioPlayerStatus.Paused, () => {
          clearTimeout(inactivityTimer);
          inactivityTimer = setTimeout(() => {
            if (audioPlayer.state.status === AudioPlayerStatus.Idle) {
              connection.disconnect();
              console.log('Disconnecting bot due to inactivity');
            }
          }, 60000);
        });
        audioPlayer.on(AudioPlayerStatus.QueueEnd, () => {
          clearTimeout(inactivityTimer);
          inactivityTimer = setTimeout(() => {
            if (audioPlayer.state.status === AudioPlayerStatus.Idle) {
              connection.disconnect();
              console.log('Disconnecting bot due to inactivity');
            }
          }, 60000);
        });
      }
    } else {
      message.reply('Cuando vemos que no es ninguna novedad que escriban mal el comando');
    }
  } else {
    message.reply('Debes estar en un canal de voz para usar este comando');
  }
}

module.exports = playCommand;
