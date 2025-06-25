const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Abrir painel de tickets via menu de seleção'),
  async execute(interaction) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('menu_ticket')
      .setPlaceholder('Escolha o tipo de ticket')
      .addOptions([
        {
          label: 'Suporte',
          description: 'Abrir um ticket de suporte',
          value: 'suporte',
          emoji: '🎟️',
        },
        {
          label: 'Denúncia',
          description: 'Reportar um usuário ou problema',
          value: 'denuncia',
          emoji: '📢',
        },
        {
          label: 'Parceria',
          description: 'Solicitar parceria com o servidor',
          value: 'parceria',
          emoji: '🤝',
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('Painel de Tickets')
      .setDescription('Selecione abaixo o tipo de ticket que deseja abrir')
      .setColor(0x5865F2);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};