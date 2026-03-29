const {
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
} = require("@discordjs/voice");
const { PermissionsBitField } = require("discord.js");
const path = require("path");
const fs = require("fs");

async function playCommand(message, queues, soundMappings, audioPlayer) {
  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel) {
    message.reply("Debes estar en un canal de voz para usar este comando");
    return;
  }

  const command = message.content.split(" ")[1];

  if (!soundMappings[command]) {
    message.reply(
      "Cuando vemos que no es ninguna novedad que escriban mal el comando",
    );
    return;
  }

  const soundPath = soundMappings[command];
  const absoluteSoundPath = path.resolve(__dirname, "..", soundPath);

  if (!fs.existsSync(absoluteSoundPath)) {
    message.reply("No encontré el archivo de audio para ese comando.");
    return;
  }

  if (!message.guild.members.me) {
    await message.guild.members.fetchMe();
  }

  const botMember = message.guild.members.me;
  const voicePermissions = voiceChannel.permissionsFor(botMember);
  const requiredPermissions = [
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.Connect,
    PermissionsBitField.Flags.Speak,
  ];
  const missingPermissions = requiredPermissions.filter(
    (permission) => !voicePermissions.has(permission),
  );

  if (missingPermissions.length > 0) {
    const missingText = missingPermissions
      .map((permission) => Object.keys(PermissionsBitField.Flags).find((key) => PermissionsBitField.Flags[key] === permission))
      .join(", ");
    message.reply(`Me faltan permisos en ese canal: ${missingText}`);
    return;
  }

  let connection = getVoiceConnection(message.guild.id);
  if (!connection || connection.joinConfig.channelId !== voiceChannel.id) {
    if (connection) {
      connection.destroy();
    }

    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    connection.on("stateChange", (oldState, newState) => {
      console.log(
        `Voice state ${oldState.status} -> ${newState.status} (guild: ${message.guild.id})`,
      );
    });

    connection.on("error", (error) => {
      console.error("Voice connection error:", error.message);
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        connection.destroy();
      }
    });
  }

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
  } catch (firstError) {
    try {
      connection.rejoin();
      await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    } catch (secondError) {
      console.error("Voice connection did not become ready:", secondError.message);
      message.reply("No pude conectarme bien al canal de voz. Verificá permisos y probá otra vez.");
      return;
    }
  }

  if (!audioPlayer.__barbaErrorHandlerAttached) {
    audioPlayer.on("error", (error) => {
      console.error("Audio player error:", error.message);
    });
    audioPlayer.__barbaErrorHandlerAttached = true;
  }

  const audioResource = createAudioResource(absoluteSoundPath);
  connection.subscribe(audioPlayer);
  audioPlayer.play(audioResource);

  const previousTimer = queues.get(message.guild.id);
  if (previousTimer) {
    clearTimeout(previousTimer);
  }

  audioPlayer.once(AudioPlayerStatus.Idle, () => {
    const inactivityTimer = setTimeout(() => {
      const activeConnection = getVoiceConnection(message.guild.id);
      if (activeConnection) {
        activeConnection.destroy();
        console.log("Disconnecting bot due to inactivity");
      }
    }, 60000);

    queues.set(message.guild.id, inactivityTimer);
  });
}

module.exports = playCommand;
