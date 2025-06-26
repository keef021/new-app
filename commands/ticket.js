const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Gerenciar tickets com botões'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🎟️ Sistema de Tickets')
      .setDescription('Use os botões abaixo para interagir com o sistema de tickets.')
      .setColor(0x5865F2);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('fechar_ticket')
        .setLabel('Fechar')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('add_user')
        .setLabel('Adicionar Usuário')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('ticket_transcript')
        .setLabel('Transcript')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('claim_ticket')
        .setLabel('Claim')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
