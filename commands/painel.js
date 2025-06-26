const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Painel de controle - Acesse todas as funções administrativas')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    // Contar tickets abertos
    const ticketsAbertos = interaction.guild.channels.cache.filter(c => 
      c.name.startsWith('ticket-') && c.type === 0
    ).size;

    const painelEmbed = new EmbedBuilder()
      .setTitle('🎛️ Painel de Controle')
      .setDescription(`**Central de administração do ${interaction.guild.name}**\n\nAcesse rapidamente todas as funcionalidades administrativas através dos botões abaixo.`)
      .setColor('#ff6b35')
      .addFields(
        { name: '🎫 Criar Painel', value: 'Criar painel de tickets', inline: true },
        { name: '📊 Estatísticas', value: `${ticketsAbertos} tickets abertos`, inline: true },
        { name: '🗑️ Limpar Tickets', value: 'Remover tickets antigos', inline: true },
        { name: '📋 Logs do Sistema', value: 'Visualizar logs recentes', inline: true },
        { name: '⚙️ Configurações', value: 'Configurar o sistema', inline: true },
        { name: '👥 Gerenciar Staff', value: 'Gerenciar equipe de suporte', inline: true }
      )
      .setFooter({ 
        text: `Painel administrativo • ${interaction.user.tag}`,
        iconURL: interaction.guild.iconURL()
      })
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp();

    // Primeira linha de botões
    const painelButtons1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('painel_create_panel')
          .setLabel('Criar Painel')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎫'),
        new ButtonBuilder()
          .setCustomId('painel_stats')
          .setLabel('Estatísticas')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📊'),
        new ButtonBuilder()
          .setCustomId('painel_cleanup')
          .setLabel('Limpar Tickets')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🗑️')
      );

    // Segunda linha de botões
    const painelButtons2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('painel_logs')
          .setLabel('Logs')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📋'),
        new ButtonBuilder()
          .setCustomId('painel_config')
          .setLabel('Configurações')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('⚙️'),
        new ButtonBuilder()
          .setCustomId('painel_staff')
          .setLabel('Gerenciar Staff')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('👥')
      );

    await interaction.reply({
      embeds: [painelEmbed],
      components: [painelButtons1, painelButtons2],
      ephemeral: true // Apenas o administrador vê
    });
  }
};
