const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

// Sistema de tickets em memória (persistência simples)
const ticketData = new Map();
const ticketStats = { created: 0, closed: 0, deleted: 0 };

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // Handler para menu de seleção de tickets
      if (interaction.isStringSelectMenu() && interaction.customId === 'menu_ticket') {
        await handleTicketMenu(interaction);
      }

      // Handler para botões
      if (interaction.isButton()) {
        switch (interaction.customId) {
          case 'fechar_ticket':
            await handleCloseTicket(interaction);
            break;
          case 'confirmar_delete':
            await handleDeleteTicket(interaction);
            break;
          case 'reabrir_ticket':
            await handleReopenTicket(interaction);
            break;
          case 'add_user':
            await handleAddUser(interaction);
            break;
          case 'ticket_transcript':
            await handleTranscript(interaction);
            break;
          case 'claim_ticket':
            await handleClaimTicket(interaction);
            break;
        }
      }

      // Handler para modal (adicionar usuário)
      if (interaction.isModalSubmit() && interaction.customId === 'add_user_modal') {
        await handleAddUserModal(interaction);
      }

    } catch (error) {
      console.error('Erro no handler de interação:', error);
      
      const errorMessage = {
        embeds: [{
          title: '❌ Erro',
          description: 'Ocorreu um erro ao processar sua solicitação.',
          color: 0xED4245,
          timestamp: new Date().toISOString()
        }],
        ephemeral: true
      };
      
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      } catch (followUpError) {
        console.error('Erro ao enviar mensagem de erro:', followUpError);
      }
    }
  }
};

async function handleTicketMenu(interaction) {
  const tipo = interaction.values[0];
  
  // Verifica se usuário já tem ticket aberto
  const existing = interaction.guild.channels.cache.find(c => 
    c.topic?.includes(interaction.user.id) && c.name.startsWith('ticket-')
  );
  
  if (existing) {
    return interaction.reply({ 
      embeds: [{
        title: '❌ Ticket Já Existe',
        description: `Você já possui um ticket aberto: ${existing}`,
        color: 0xED4245
      }],
      ephemeral: true 
    });
  }

  await interaction.deferReply({ ephemeral: true });

  // Procura ou cria categoria de tickets
  let category = interaction.guild.channels.cache.find(c => 
    c.name === 'tickets' && c.type === ChannelType.GuildCategory
  );
  
  if (!category) {
    try {
      category = await interaction.guild.channels.create({
        name: '🎫・tickets',
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          }
        ]
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  }

  // Determina emoji e cor baseado no tipo
  const tipoConfig = {
    suporte: { emoji: '🎟️', color: 0x5865F2 },
    denuncia: { emoji: '📢', color: 0xED4245 },
    parceria: { emoji: '🤝', color: 0x57F287 }
  };

  const config = tipoConfig[tipo] || tipoConfig.suporte;
  const ticketNumber = (ticketStats.created + 1).toString().padStart(4, '0');

  // Cria o canal do ticket
  const channel = await interaction.guild.channels.create({
    name: `ticket-${ticketNumber}-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    type: ChannelType.GuildText,
    topic: `${interaction.user.id}|${tipo}|${Date.now()}`,
    parent: category?.id || null,
    permissionOverwrites: [
      { 
        id: interaction.guild.id, 
        deny: [PermissionFlagsBits.ViewChannel] 
      },
      { 
        id: interaction.user.id, 
        allow: [
          PermissionFlagsBits.ViewChannel, 
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles
        ] 
      }
    ]
  });

  // Salva dados do ticket
  ticketData.set(channel.id, {
    owner: interaction.user.id,
    type: tipo,
    created: Date.now(),
    number: ticketNumber,
    claimed: null,
    status: 'open'
  });

  ticketStats.created++;

  // Componentes do ticket
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('fechar_ticket')
      .setLabel('Fechar Ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('add_user')
      .setLabel('Adicionar Usuário')
      .setEmoji('➕')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('claim_ticket')
      .setLabel('Assumir Ticket')
      .setEmoji('🙋')
      .setStyle(ButtonStyle.Success)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_transcript')
      .setLabel('Transcrição')
      .setEmoji('📝')
      .setStyle(ButtonStyle.Secondary)
  );

  const embed = new EmbedBuilder()
    .setTitle(`${config.emoji} Ticket #${ticketNumber}`)
    .setDescription(`**Tipo:** ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}
    
**Usuário:** ${interaction.user}
**ID:** ${interaction.user.id}
**Criado:** <t:${Math.floor(Date.now() / 1000)}:R>

📝 Descreva seu problema ou solicitação detalhadamente. Nossa equipe responderá em breve.

**Status:** 🟢 Aberto`)
    .setColor(config.color)
    .setFooter({ 
      text: `Ticket System • ID: ${ticketNumber}`,
      iconURL: interaction.guild.iconURL()
    })
    .setTimestamp();

  await channel.send({ 
    content: `${interaction.user} | Bem-vindo ao seu ticket!`, 
    embeds: [embed], 
    components: [row1, row2] 
  });
  
  await interaction.editReply({ 
    embeds: [{
      title: '✅ Ticket Criado',
      description: `Seu ticket foi criado com sucesso!\n\n**Canal:** ${channel}\n**Número:** #${ticketNumber}`,
      color: 0x57F287
    }]
  });
}

async function handleCloseTicket(interaction) {
  const ticketInfo = ticketData.get(interaction.channel.id);
  
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('confirmar_delete')
      .setLabel('Deletar')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('reabrir_ticket')
      .setLabel('Reabrir')
      .setEmoji('🔓')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('ticket_transcript')
      .setLabel('Salvar Transcrição')
      .setEmoji('💾')
      .setStyle(ButtonStyle.Secondary)
  );
  
  const embed = new EmbedBuilder()
    .setTitle('🔒 Ticket Fechado')
    .setDescription(`Ticket fechado por ${interaction.user}\n\n**Ações disponíveis:**\n🗑️ Deletar ticket\n🔓 Reabrir ticket\n💾 Salvar transcrição`)
    .setColor(0xFEE75C)
    .setTimestamp();

  if (ticketInfo) {
    ticketInfo.status = 'closed';
    ticketStats.closed++;
  }
    
  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleDeleteTicket(interaction) {
  const canal = interaction.channel;
  const ticketInfo = ticketData.get(canal.id);
  
  const embed = new EmbedBuilder()
    .setTitle('🗑️ Deletando Ticket')
    .setDescription('Este ticket será **deletado em 10 segundos**...\n\n⚠️ Esta ação não pode ser desfeita!')
    .setColor(0xED4245)
    .addFields({
      name: '⏱️ Contagem Regressiva',
      value: '```10 segundos```',
      inline: true
    });
    
  await interaction.update({ embeds: [embed], components: [] });

  // Contagem regressiva
  for (let i = 9; i > 0; i--) {
    setTimeout(async () => {
      try {
        embed.setFields({
          name: '⏱️ Contagem Regressiva',
          value: `\`\`\`${i} segundos\`\`\``,
          inline: true
        });
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        // Canal pode já ter sido deletado
      }
    }, (10 - i) * 1000);
  }
  
  setTimeout(() => {
    if (ticketInfo) {
      ticketData.delete(canal.id);
      ticketStats.deleted++;
    }
    
    canal.delete().catch(error => {
      console.error('Erro ao deletar canal:', error);
    });
  }, 10000);
}

async function handleReopenTicket(interaction) {
  const ticketInfo = ticketData.get(interaction.channel.id);
  
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('fechar_ticket')
      .setLabel('Fechar Ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('add_user')
      .setLabel('Adicionar Usuário')
      .setEmoji('➕')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('claim_ticket')
      .setLabel('Assumir Ticket')
      .setEmoji('🙋')
      .setStyle(ButtonStyle.Success)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_transcript')
      .setLabel('Transcrição')
      .setEmoji('📝')
      .setStyle(ButtonStyle.Secondary)
  );
  
  const embed = new EmbedBuilder()
    .setTitle('🔓 Ticket Reaberto')
    .setDescription(`Ticket reaberto por ${interaction.user}\n\n**Status:** 🟢 Aberto`)
    .setColor(0x57F287)
    .setTimestamp();

  if (ticketInfo) {
    ticketInfo.status = 'open';
  }
    
  await interaction.update({ embeds: [embed], components: [row1, row2] });
}

async function handleAddUser(interaction) {
  const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
  
  const modal = new ModalBuilder()
    .setCustomId('add_user_modal')
    .setTitle('Adicionar Usuário ao Ticket');

  const userInput = new TextInputBuilder()
    .setCustomId('user_id')
    .setLabel('ID ou @menção do usuário')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 123456789 ou @usuario')
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder().addComponents(userInput);
  modal.addComponents(firstActionRow);

  await interaction.showModal(modal);
}

async function handleAddUserModal(interaction) {
  const userId = interaction.fields.getTextInputValue('user_id').replace(/[<@!>]/g, '');
  
  try {
    const user = await interaction.guild.members.fetch(userId);
    
    await interaction.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });

    const embed = new EmbedBuilder()
      .setTitle('✅ Usuário Adicionado')
      .setDescription(`${user} foi adicionado ao ticket por ${interaction.user}`)
      .setColor(0x57F287)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    
  } catch (error) {
    await interaction.reply({
      embeds: [{
        title: '❌ Erro',
        description: 'Usuário não encontrado. Verifique o ID ou menção.',
        color: 0xED4245
      }],
      ephemeral: true
    });
  }
}

async function handleTranscript(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  try {
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const transcript = messages.reverse().map(msg => 
      `[${msg.createdAt.toLocaleString('pt-BR')}] ${msg.author.tag}: ${msg.content}`
    ).join('\n');
    
    const buffer = Buffer.from(transcript, 'utf8');
    
    await interaction.editReply({
      content: '📝 Aqui está a transcrição do ticket:',
      files: [{
        attachment: buffer,
        name: `ticket-transcript-${interaction.channel.name}.txt`
      }]
    });
    
  } catch (error) {
    await interaction.editReply({
      content: '❌ Erro ao gerar transcrição do ticket.'
    });
  }
}

async function handleClaimTicket(interaction) {
  const ticketInfo = ticketData.get(interaction.channel.id);
  
  if (ticketInfo && ticketInfo.claimed) {
    return interaction.reply({
      embeds: [{
        title: '❌ Ticket Já Assumido',
        description: `Este ticket já foi assumido por <@${ticketInfo.claimed}>`,
        color: 0xED4245
      }],
      ephemeral: true
    });
  }

  if (ticketInfo) {
    ticketInfo.claimed = interaction.user.id;
  }

  const embed = new EmbedBuilder()
    .setTitle('🙋 Ticket Assumido')
    .setDescription(`${interaction.user} assumiu este ticket e irá ajudá-lo.`)
    .setColor(0x5865F2)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
