const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Informações sobre o bot'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 Informações do Bot')
      .setDescription('Sistema de Tickets Avançado para Discord')
      .addFields(
        { name: '📊 Servidores', value: interaction.client.guilds.cache.size.toString(), inline: true },
        { name: '👥 Usuários', value: interaction.client.users.cache.size.toString(), inline: true },
        { name: '📡 Ping', value: `${interaction.client.ws.ping}ms`, inline: true },
        { name: '⏱️ Uptime', value: `<t:${Math.floor((Date.now() - interaction.client.uptime) / 1000)}:R>`, inline: true },
        { name: '💾 Memória', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true },
        { name: '📋 Versão', value: '2.0.0', inline: true }
      )
      .setColor(0x5865F2)
      .setFooter({ text: 'Desenvolvido com ❤️' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
