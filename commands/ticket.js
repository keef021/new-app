const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Sistema de tickets - Gerenciar tickets de suporte'),

  async execute(interaction) {
    const ticketEmbed = new EmbedBuilder()
      .setTitle('🎫 Sistema de Tickets')
      .setDescription('Gerencie seus tickets de suporte de forma fácil e organizada!')
      .setColor('#0099ff')
      .addFields(
        { name: '🔒 Fechar Ticket', value: 'Feche o ticket atual', inline: true },
        { name: '➕ Adicionar Usuário', value: 'Adicione alguém ao ticket', inline: true },
        { name: '➖ Remover Usuário', value: 'Remova alguém do ticket', inline: true },
        { name: '📝 Transcrição', value: 'Gere um arquivo de transcrição', inline: true },
        { name: '🙋 Assumir Ticket', value: 'Assuma a responsabilidade do ticket', inline: true },
        { name: '📊 Estatísticas', value: 'Veja estatísticas dos tickets', inline: true }
      )
      .setFooter({ 
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();

    // Primeira linha de botões
    const ticketButtons1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel('Fechar Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒'),
        new ButtonBuilder()
          .setCustomId('ticket_add_user')
          .setLabel('Adicionar Usuário')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('ticket_remove_user')
          .setLabel('Remover Usuário')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('➖')
      );

    // Segunda linha de botões
    const ticketButtons2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_transcript')
          .setLabel('Transcrição')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📝'),
        new ButtonBuilder()
          .setCustomId('ticket_claim')
          .setLabel('Assumir Ticket')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🙋'),
        new ButtonBuilder()
          .setCustomId('ticket_stats')
          .setLabel('Estatísticas')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📊')
      );

    await interaction.reply({
      embeds: [ticketEmbed],
      components: [ticketButtons1, ticketButtons2],
      ephemeral: false
    });
  }
};
