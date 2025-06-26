const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Gerenciar tickets')
    .addSubcommand(subcommand =>
      subcommand
        .setName('fechar')
        .setDescription('Fechar o ticket atual'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('adicionar')
        .setDescription('Adicionar usuário ao ticket')
        .addUserOption(option =>
          option.setName('usuario')
            .setDescription('Usuário para adicionar')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remover')
        .setDescription('Remover usuário do ticket')
        .addUserOption(option =>
          option.setName('usuario')
            .setDescription('Usuário para remover')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('transcript')
        .setDescription('Gerar transcrição do ticket'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    // Verifica se está em um ticket
    if (!interaction.channel.name.startsWith('ticket-')) {
      return interaction.reply({
        embeds: [{
          title: '❌ Erro',
          description: 'Este comando só pode ser usado em canais de ticket.',
          color: 0xED4245
        }],
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'fechar') {
      const embed = new EmbedBuilder()
        .setTitle('🔒 Ticket Fechado')
        .setDescription(`Ticket fechado por ${interaction.user}`)
        .setColor(0xFEE75C)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'adicionar') {
      const usuario = interaction.options.getUser('usuario');
      
      try {
        await interaction.channel.permissionOverwrites.edit(usuario.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        });

        const embed = new EmbedBuilder()
          .setTitle('✅ Usuário Adicionado')
          .setDescription(`${usuario} foi adicionado ao ticket por ${interaction.user}`)
          .setColor(0x57F287)
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
      } catch (error) {
        await interaction.reply({
          embeds: [{
            title: '❌ Erro',
            description: 'Não foi possível adicionar o usuário.',
            color: 0xED4245
          }],
          ephemeral: true
        });
      }

    } else if (subcommand === 'remover') {
      const usuario = interaction.options.getUser('usuario');
      
      try {
        await interaction.channel.permissionOverwrites.edit(usuario.id, {
          ViewChannel: false
        });

        const embed = new EmbedBuilder()
          .setTitle('✅ Usuário Removido')
          .setDescription(`${usuario} foi removido do ticket por ${interaction.user}`)
          .setColor(0xFEE75C)
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
      } catch (error) {
        await interaction.reply({
          embeds: [{
            title: '❌ Erro',
            description: 'Não foi possível remover o usuário.',
            color: 0xED4245
          }],
          ephemeral: true
        });
      }

    } else if (subcommand === 'transcript') {
      await interaction.deferReply();
      
      try {
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = messages.reverse().map(msg => {
          const timestamp = msg.createdAt.toLocaleString('pt-BR');
          const author = msg.author.tag;
          const content = msg.content || '[Anexo/Embed]';
          return `[${timestamp}] ${author}: ${content}`;
        }).join('\n');
        
        const buffer = Buffer.from(transcript, 'utf8');
        
        await interaction.editReply({
          content: '📝 Transcrição do ticket gerada:',
          files: [{
            attachment: buffer,
            name: `transcript-${interaction.channel.name}-${Date.now()}.txt`
          }]
        });
        
      } catch (error) {
        await interaction.editReply({
          content: '❌ Erro ao gerar transcrição.'
        });
      }
    }
  }
};
