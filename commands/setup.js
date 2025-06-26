const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configurar o sistema de tickets')
    .addSubcommand(subcommand =>
      subcommand
        .setName('categoria')
        .setDescription('Criar categoria para tickets'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('logs')
        .setDescription('Configurar canal de logs')
        .addChannelOption(option =>
          option.setName('canal')
            .setDescription('Canal para logs')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('role')
        .setDescription('Configurar cargo de staff')
        .addRoleOption(option =>
          option.setName('cargo')
            .setDescription('Cargo que pode gerenciar tickets')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'categoria') {
      try {
        const categoria = await interaction.guild.channels.create({
          name: '🎫・TICKETS',
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionFlagsBits.ViewChannel]
            }
          ]
        });

        await interaction.reply({
          embeds: [{
            title: '✅ Categoria Criada',
            description: `Categoria ${categoria} criada com sucesso!`,
            color: 0x57F287
          }],
          ephemeral: true
        });

      } catch (error) {
        await interaction.reply({
          embeds: [{
            title: '❌ Erro',
            description: 'Não foi possível criar a categoria.',
            color: 0xED4245
          }],
          ephemeral: true
        });
      }

    } else if (subcommand === 'logs') {
      const canal = interaction.options.getChannel('canal');
      
      // Aqui você salvaria a configuração em um banco de dados
      // Por simplicidade, vamos apenas confirmar
      
      await interaction.reply({
        embeds: [{
          title: '✅ Logs Configurado',
          description: `Canal de logs definido como ${canal}`,
          color: 0x57F287
        }],
        ephemeral: true
      });

    } else if (subcommand === 'role') {
      const cargo = interaction.options.getRole('cargo');
      
      // Aqui você salvaria a configuração em um banco de dados
      
      await interaction.reply({
        embeds: [{
          title: '✅ Cargo Configurado',
          description: `Cargo de staff definido como ${cargo}`,
          color: 0x57F287
        }],
        ephemeral: true
      });
    }
  }
};
