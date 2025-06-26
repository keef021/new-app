const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Gerenciar painel de tickets')
    .addSubcommand(subcommand =>
      subcommand
        .setName('criar')
        .setDescription('Criar painel de tickets')
        .addChannelOption(option =>
          option.setName('canal')
            .setDescription('Canal onde enviar o painel')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('Ver estatísticas dos tickets'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'criar') {
      const canal = interaction.options.getChannel('canal') || interaction.channel;

      const menu = new StringSelectMenuBuilder()
        .setCustomId('menu_ticket')
        .setPlaceholder('🎫 Selecione o tipo de ticket')
        .addOptions([
          {
            label: 'Suporte Técnico',
            description: 'Problemas técnicos e dúvidas gerais',
            value: 'suporte',
            emoji: '🛠️',
          },
          {
            label: 'Denúncia',
            description: 'Reportar usuários ou problemas',
            value: 'denuncia',
            emoji: '⚠️',
          },
          {
            label: 'Parceria',
            description: 'Propostas de parceria',
            value: 'parceria',
            emoji: '🤝',
          },
          {
            label: 'Outros',
            description: 'Outros assuntos',
            value: 'outros',
            emoji: '📝',
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      const embed = new EmbedBuilder()
        .setTitle('🎫 Sistema de Tickets')
        .setDescription(`Bem-vindo ao sistema de tickets do **${interaction.guild.name}**!

**Como usar:**
1️⃣ Selecione o tipo de ticket no menu abaixo
2️⃣ Aguarde a criação do seu canal privado
3️⃣ Descreva seu problema ou solicitação
4️⃣ Nossa equipe responderá em breve

**Tipos disponíveis:**
🛠️ **Suporte Técnico** - Problemas e dúvidas
⚠️ **Denúncia** - Reportar problemas
🤝 **Parceria** - Propostas comerciais
📝 **Outros** - Demais assuntos

**Regras:**
• Apenas 1 ticket por usuário
• Seja claro e educado
• Não spam`)
        .setColor(0x5865F2)
        .setFooter({ 
          text: `${interaction.guild.name} • Sistema de Tickets`,
          iconURL: interaction.guild.iconURL()
        })
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp();

      try {
        await canal.send({ embeds: [embed], components: [row] });
        
        await interaction.reply({
          embeds: [{
            title: '✅ Painel Criado',
            description: `Painel de tickets enviado para ${canal}`,
            color: 0x57F287
          }],
          ephemeral: true
        });
      } catch (error) {
        await interaction.reply({
          embeds: [{
            title: '❌ Erro',
            description: 'Não foi possível enviar o painel no canal especificado.',
            color: 0xED4245
          }],
          ephemeral: true
        });
      }

    } else if (subcommand === 'stats') {
      const ticketsAbertos = interaction.guild.channels.cache.filter(c => 
        c.name.startsWith('ticket-') && c.type === 0
      ).size;

      const embed = new EmbedBuilder()
        .setTitle('📊 Estatísticas dos Tickets')
        .addFields(
          { name: '🎫 Tickets Criados', value: '0', inline: true },
          { name: '🔒 Tickets Fechados', value: '0', inline: true },
          { name: '🗑️ Tickets Deletados', value: '0', inline: true },
          { name: '🟢 Tickets Abertos', value: ticketsAbertos.toString(), inline: true },
          { name: '📈 Total Processados', value: '0', inline: true },
          { name: '⏱️ Tempo Médio', value: 'N/A', inline: true }
        )
        .setColor(0x5865F2)
        .setFooter({ text: 'Estatísticas em tempo real' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
