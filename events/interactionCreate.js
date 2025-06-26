module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Erro ao executar o comando.', ephemeral: true });
      }
    } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
      const customId = interaction.customId;
      await interaction.reply({ content: `Função para: \\`${customId}\\` não implementada.`, ephemeral: true });
    }
  },
};
