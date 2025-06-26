const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Abrir painel de tickets via menu de seleção'),
  async execute(interaction) {
    try {
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
        .setTitle('🎫 Painel de Tickets')
        .setDescription('Selecione abaixo o tipo de ticket que deseja abrir.\n\n**Tipos disponíveis:**\n🎟️ **Suporte** - Para dúvidas e ajuda\n📢 **Denúncia** - Para reportar problemas\n🤝 **Parceria** - Para propostas de parceria')
        .setColor(0x5865F2)
        .setFooter({ text: 'Sistema de Tickets' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error('Erro no comando painel:', error);
      await interaction.reply({ 
        content: 'Erro ao criar o painel de tickets!', 
        ephemeral: true 
      });
    }
  }
};
