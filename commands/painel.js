const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Exibe o painel de gerenciamento do sistema de tickets'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🛠️ Painel de Gerenciamento')
      .setDescription('Selecione uma opção no menu abaixo para configurar o sistema de tickets.')
      .setColor(0x2F3136);

    const select = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('menu_ticket')
        .setPlaceholder('Selecione uma opção')
        .addOptions([
          {
            label: 'Configurar Categorias',
            description: 'Defina onde os tickets serão criados',
            value: 'config_categoria'
          },
          {
            label: 'Mensagens de Ticket',
            description: 'Configure as mensagens de abertura/fechamento',
            value: 'config_mensagem'
          },
          {
            label: 'Logs',
            description: 'Canal de logs de tickets',
            value: 'config_logs'
          },
          {
            label: 'Resetar Configurações',
            description: 'Apagar todas as configurações do sistema',
            value: 'reset_config'
          }
        ])
    );

    await interaction.reply({ embeds: [embed], components: [select], ephemeral: true });
  }
};
