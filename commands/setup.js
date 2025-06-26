const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Inicializar configurações do sistema de tickets'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Configurações Iniciais')
      .setDescription('Utilize os botões abaixo para configurar o sistema de tickets.')
      .setColor(0x57F287);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('setup_categoria')
        .setLabel('Criar Categoria')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('setup_logs')
        .setLabel('Configurar Logs')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('setup_cargo')
        .setLabel('Configurar Cargo')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
