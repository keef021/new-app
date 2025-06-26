const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configurar o sistema de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Verificar se já existe categoria de tickets
    const categoria = interaction.guild.channels.cache.find(c => 
      c.name.includes('ticket') && c.type === 4
    );

    // Verificar configurações existentes
    const hasCategory = categoria ? '✅' : '❌';
    const categoryName = categoria ? categoria.name : 'Não configurado';

    const setupEmbed = new EmbedBuilder()
      .setTitle('⚙️ Configuração do Sistema')
      .setDescription(`**Configure o sistema de tickets do ${interaction.guild.name}**\n\nEste painel permite configurar todos os aspectos do sistema de tickets de forma rápida e fácil.`)
      .setColor('#57F287')
      .addFields(
        { name: '📂 Categoria de Tickets', value: `${hasCategory} ${categoryName}`, inline: true },
        { name: '📋 Canal de Logs', value: '❌ Não configurado', inline: true },
        { name: '🎭 Cargo de Staff', value: '❌ Não configurado', inline: true },
        { name: '🔧 Status do Sistema', value: '🟡 Configuração necessária', inline: false },
        { name: '📊 Estatísticas', value: `${interaction.guild.memberCount} membros\n${interaction.guild.channels.cache.size} canais`, inline: true },
        { name: '🛡️ Permissões', value: 'Verificar permissões do bot', inline: true }
      )
      .setFooter({ 
        text: `Sistema de configuração • ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp();

    // Primeira linha de botões - Configuração básica
    const setupButtons1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('setup_category')
          .setLabel('Criar Categoria')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📂'),
        new ButtonBuilder()
          .setCustomId('setup_logs')
          .setLabel('Configurar Logs')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📋'),
        new ButtonBuilder()
          .setCustomId('setup_role')
          .setLabel('Definir Staff')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🎭')
      );

    // Segunda linha de botões - Funções avançadas
    const setupButtons2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('setup_permissions')
          .setLabel('Verificar Permissões')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🛡️'),
        new ButtonBuilder()
          .setCustomId('setup_auto_setup')
          .setLabel('Configuração Automática')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🚀'),
        new ButtonBuilder()
          .setCustomId('setup_reset')
          .setLabel('Resetar Sistema')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔄')
      );

    // Terceira linha - Finalização
    const setupButtons3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('setup_test')
          .setLabel('Testar Sistema')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🧪'),
        new ButtonBuilder()
          .setCustomId('setup_help')
          .setLabel('Ajuda')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('❓')
      );

    await interaction.reply({
      embeds: [setupEmbed],
      components: [setupButtons1, setupButtons2, setupButtons3],
      ephemeral: true // Apenas o administrador vê
    });
  }
};
