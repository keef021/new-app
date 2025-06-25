const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isStringSelectMenu() && interaction.customId === 'menu_ticket') {
      const tipo = interaction.values[0];
      const existing = interaction.guild.channels.cache.find(c => c.topic === interaction.user.id);
      if (existing) return interaction.reply({ content: 'Você já possui um ticket aberto.', ephemeral: true });

      const category = interaction.guild.channels.cache.find(c => c.name === 'tickets' && c.type === 4);
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        topic: interaction.user.id,
        parent: category?.id || null,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
        ]
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('fechar_ticket').setLabel('🔒 Fechar').setStyle(ButtonStyle.Secondary)
      );

      const embed = new EmbedBuilder()
        .setTitle('Ticket Aberto')
        .setDescription(`Tipo: **${tipo}**
Aguarde a equipe para atendimento.`)
        .setColor(0x2F3136)
        .setFooter({ text: 'Use o botão abaixo para fechar o ticket.' });

      await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
      await interaction.reply({ content: `Seu ticket foi criado: ${channel}`, ephemeral: true });
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'fechar_ticket') {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('confirmar_delete').setLabel('❌ Deletar').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('reabrir_ticket').setLabel('🔓 Reabrir').setStyle(ButtonStyle.Success)
        );
        const embed = new EmbedBuilder()
          .setTitle('Ticket Fechado')
          .setDescription('Deseja deletar ou reabrir o ticket?')
          .setColor(0xED4245);
        await interaction.update({ embeds: [embed], components: [row] });
      } else if (interaction.customId === 'confirmar_delete') {
        const canal = interaction.channel;
        await canal.send('Deletando em 5 segundos...');
        setTimeout(() => canal.delete().catch(() => {}), 5000);
      } else if (interaction.customId === 'reabrir_ticket') {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('fechar_ticket').setLabel('🔒 Fechar').setStyle(ButtonStyle.Secondary)
        );
        const embed = new EmbedBuilder()
          .setTitle('Ticket Reaberto')
          .setDescription('Você reabriu este ticket.')
          .setColor(0x57F287);
        await interaction.update({ embeds: [embed], components: [row] });
      }
    }
  }
};