// events/interactionCreate.js

const { Events } = require('discord.js');
const { handleButtonInteraction } = require('../handlers/buttonHandlers'); // Importe o arquivo de handlers

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    
    // Lidar com comandos slash
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`Comando ${interaction.commandName} não encontrado.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ 
            content: 'Houve um erro ao executar este comando!', 
            ephemeral: true 
          });
        } else {
          await interaction.reply({ 
            content: 'Houve um erro ao executar este comando!', 
            ephemeral: true 
          });
        }
      }
    }

    // Lidar com interações de botões
    else if (interaction.isButton()) {
      try {
        await handleButtonInteraction(interaction);
      } catch (error) {
        console.error('Erro na interação do botão:', error);
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: '❌ Ocorreu um erro ao processar sua solicitação.',
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: '❌ Ocorreu um erro ao processar sua solicitação.',
            ephemeral: true
          });
        }
      }
    }

    // Lidar com modais
    else if (interaction.isModalSubmit()) {
      try {
        await handleModalSubmit(interaction);
      } catch (error) {
        console.error('Erro no modal:', error);
        await interaction.reply({
          content: '❌ Ocorreu um erro ao processar o formulário.',
          ephemeral: true
        });
      }
    }
  }
};

// Função para lidar com modais
async function handleModalSubmit(interaction) {
  const { customId } = interaction;

  switch (customId) {
    case 'add_user_modal':
      await handleAddUserModal(interaction);
      break;
    case 'remove_user_modal':
      await handleRemoveUserModal(interaction);
      break;
    case 'create_panel_modal':
      await handleCreatePanelModal(interaction);
      break;
    case 'setup_logs_modal':
      await handleSetupLogsModal(interaction);
      break;
    case 'setup_role_modal':
      await handleSetupRoleModal(interaction);
      break;
    default:
      await interaction.reply({
        content: '❌ Modal não reconhecido.',
        ephemeral: true
      });
  }
}

// Handlers para modais específicos
async function handleAddUserModal(interaction) {
  const userId = interaction.fields.getTextInputValue('user_id');
  
  try {
    // Extrair ID do usuário (remover < @ ! > se necessário)
    const cleanUserId = userId.replace(/[<@!>]/g, '');
    const user = await interaction.guild.members.fetch(cleanUserId);
    
    await interaction.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });

    await interaction.reply({
      embeds: [{
        title: '✅ Usuário Adicionado',
        description: `${user} foi adicionado ao ticket.`,
        color: 0x57F287
      }],
      ephemeral: true
    });

  } catch (error) {
    await interaction.reply({
      embeds: [{
        title: '❌ Erro',
        description: 'Usuário não encontrado ou erro ao adicionar.',
        color: 0xED4245
      }],
      ephemeral: true
    });
  }
}

async function handleRemoveUserModal(interaction) {
  const userId = interaction.fields.getTextInputValue('user_id');
  
  try {
    const cleanUserId = userId.replace(/[<@!>]/g, '');
    const user = await interaction.guild.members.fetch(cleanUserId);
    
    await interaction.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: false
    });

    await interaction.reply({
      embeds: [{
        title: '✅ Usuário Removido',
        description: `${user} foi removido do ticket.`,
        color: 0x57F287
      }],
      ephemeral: true
    });

  } catch (error) {
    await interaction.reply({
      embeds: [{
        title: '❌ Erro',
        description: 'Usuário não encontrado ou erro ao remover.',
        color: 0xED4245
      }],
      ephemeral: true
    });
  }
}

async function handleCreatePanelModal(interaction) {
  const channelId = interaction.fields.getTextInputValue('channel_id');
  
  try {
    let targetChannel;
    
    if (channelId) {
      targetChannel = interaction.guild.channels.cache.get(channelId);
      if (!targetChannel) {
        throw new Error('Canal não encontrado');
      }
    } else {
      targetChannel = interaction.channel;
    }

    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

    const painelEmbed = new EmbedBuilder()
      .setTitle('🎫 Sistema de Tickets')
      .setDescription('**Precisa de ajuda?**\n\nClique no botão abaixo para abrir um ticket e nossa equipe irá te ajudar o mais rápido possível!')
      .addFields(
        { name: '📝 Como funciona?', value: '1. Clique em "Abrir Ticket"\n2. Descreva seu problema\n3. Aguarde a resposta da equipe', inline: false },
        { name: '⏰ Horário de Atendimento', value: 'Segunda a Sexta: 09:00 - 18:00\nSábado e Domingo: 10:00 - 16:00', inline: true },
        { name: '📞 Tempo de Resposta', value: 'Aproximadamente 1-2 horas', inline: true }
      )
      .setColor(0x5865F2)
      .setFooter({ text: 'Sistema de Tickets • Clique no botão para começar' })
      .setTimestamp();

    const painelButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('open_ticket')
          .setLabel('Abrir Ticket')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎫')
      );

    await targetChannel.send({
      embeds: [painelEmbed],
      components: [painelButton]
    });

    await interaction.reply({
      embeds: [{
        title: '✅ Painel Criado',
        description: `Painel de tickets criado em ${targetChannel}`,
        color: 0x57F287
      }],
      ephemeral: true
    });

  } catch (error) {
    await interaction.reply({
      embeds: [{
        title: '❌ Erro',
        description: 'Não foi possível criar o painel.',
        color: 0xED4245
      }],
      ephemeral: true
    });
  }
}

async function handleSetupLogsModal(interaction) {
  const channelId = interaction.fields.getTextInputValue('log_channel_id');
  
  try {
    const channel = interaction.guild.channels.cache.get(channelId);
    
    if (!channel) {
      throw new Error('Canal não encontrado');
    }

    // Aqui você salvaria a configuração no banco de dados
    // Por agora, apenas confirma que foi configurado
    
    await interaction.reply({
      embeds: [{
        title: '✅ Logs Configurados',
        description: `Canal de logs definido como ${channel}`,
        color: 0x57F287
      }],
      ephemeral: true
    });

  } catch (error) {
    await interaction.reply({
      embeds: [{
        title: '❌ Erro',
        description: 'Canal não encontrado.',
        color: 0xED4245
      }],
      ephemeral: true
    });
  }
}

async function handleSetupRoleModal(interaction) {
  const roleId = interaction.fields.getTextInputValue('staff_role_id');
  
  try {
    const role = interaction.guild.roles.cache.get(roleId);
    
    if (!role) {
      throw new Error('Cargo não encontrado');
    }

    // Aqui você salvaria a configuração no banco de dados
    
    await interaction.reply({
      embeds: [{
        title: '✅ Cargo Configurado',
        description: `Cargo de staff definido como ${role}`,
        color: 0x57F287
      }],
      ephemeral: true
    });

  } catch (error) {
    await interaction.reply({
      embeds: [{
        title: '❌ Erro',
        description: 'Cargo não encontrado.',
        color: 0xED4245
      }],
      ephemeral: true
    });
  }
}
