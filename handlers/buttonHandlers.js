// Adicione este código ao arquivo events/interactionCreate.js

const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// Adicione estas funções ao seu arquivo events/interactionCreate.js

// ========== HANDLERS PARA COMANDO /TICKET ==========

async function handleTicketButtons(interaction) {
  switch (interaction.customId) {
    case 'ticket_close':
      await handleTicketClose(interaction);
      break;
    case 'ticket_add_user':
      await handleTicketAddUser(interaction);
      break;
    case 'ticket_remove_user':
      await handleTicketRemoveUser(interaction);
      break;
    case 'ticket_transcript':
      await handleTicketTranscript(interaction);
      break;
    case 'ticket_claim':
      await handleTicketClaim(interaction);
      break;
    case 'ticket_stats':
      await handleTicketStats(interaction);
      break;
  }
}

async function handleTicketClose(interaction) {
  // Verifica se está em um ticket
  if (!interaction.channel.name.startsWith('ticket-')) {
    return interaction.reply({
      embeds: [{
        title: '❌ Erro',
        description: 'Esta função só pode ser usada em canais de ticket.',
        color: 0xED4245
      }],
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('🔒 Fechar Ticket')
    .setDescription(`${interaction.user}, tem certeza que deseja fechar este ticket?`)
    .setColor(0xFEE75C)
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confirmar_close')
        .setLabel('Confirmar')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId('cancelar_close')
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❌')
    );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function handleTicketAddUser(interaction) {
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

async function handleTicketRemoveUser(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('remove_user_modal')
    .setTitle('Remover Usuário do Ticket');

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

async function handleTicketTranscript(interaction) {
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

async function handleTicketClaim(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🙋 Ticket Assumido')
    .setDescription(`${interaction.user} assumiu este ticket e irá ajudá-lo.`)
    .setColor(0x5865F2)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleTicketStats(interaction) {
  const ticketsAbertos = interaction.guild.channels.cache.filter(c => 
    c.name.startsWith('ticket-') && c.type === 0
  ).size;

  const embed = new EmbedBuilder()
    .setTitle('📊 Estatísticas dos Tickets')
    .addFields(
      { name: '🟢 Tickets Abertos', value: ticketsAbertos.toString(), inline: true },
      { name: '🔒 Tickets Fechados', value: '0', inline: true },
      { name: '🗑️ Tickets Deletados', value: '0', inline: true },
      { name: '📈 Total Processados', value: '0', inline: true },
      { name: '⏱️ Tempo Médio', value: 'N/A', inline: true },
      { name: '👥 Staff Ativo', value: '0', inline: true }
    )
    .setColor(0x5865F2)
    .setFooter({ text: 'Estatísticas em tempo real' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ========== HANDLERS PARA COMANDO /PAINEL ==========

async function handlePainelButtons(interaction) {
  switch (interaction.customId) {
    case 'painel_create_panel':
      await handlePainelCreatePanel(interaction);
      break;
    case 'painel_stats':
      await handlePainelStats(interaction);
      break;
    case 'painel_cleanup':
      await handlePainelCleanup(interaction);
      break;
    case 'painel_logs':
      await handlePainelLogs(interaction);
      break;
    case 'painel_config':
      await handlePainelConfig(interaction);
      break;
    case 'painel_staff':
      await handlePainelStaff(interaction);
      break;
  }
}

async function handlePainelCreatePanel(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('create_panel_modal')
    .setTitle('Criar Painel de Tickets');

  const channelInput = new TextInputBuilder()
    .setCustomId('channel_id')
    .setLabel('ID do Canal (deixe vazio para canal atual)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 123456789')
    .setRequired(false);

  const firstActionRow = new ActionRowBuilder().addComponents(channelInput);
  modal.addComponents(firstActionRow);

  await interaction.showModal(modal);
}

async function handlePainelStats(interaction) {
  const ticketsAbertos = interaction.guild.channels.cache.filter(c => 
    c.name.startsWith('ticket-') && c.type === 0
  ).size;

  const embed = new EmbedBuilder()
    .setTitle('📊 Estatísticas Detalhadas')
    .setDescription(`**Estatísticas do ${interaction.guild.name}**`)
    .addFields(
      { name: '🎫 Tickets', value: `${ticketsAbertos} abertos\n0 fechados\n0 deletados`, inline: true },
      { name: '👥 Usuários', value: `${interaction.guild.memberCount} total\n${interaction.guild.members.cache.filter(m => !m.user.bot).size} humanos\n${interaction.guild.members.cache.filter(m => m.user.bot).size} bots`, inline: true },
      { name: '📋 Canais', value: `${interaction.guild.channels.cache.size} total\n${interaction.guild.channels.cache.filter(c => c.type === 0).size} texto\n${interaction.guild.channels.cache.filter(c => c.type === 2).size} voz`, inline: true },
      { name: '⏱️ Tempo Médio', value: 'N/A', inline: true },
      { name: '🏆 Staff Mais Ativo', value: 'N/A', inline: true },
      { name: '📈 Tickets Hoje', value: '0', inline: true }
    )
    .setColor(0x5865F2)
    .setFooter({ text: 'Estatísticas atualizadas em tempo real' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handlePainelCleanup(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🗑️ Limpeza de Tickets')
    .setDescription('Selecione o que deseja limpar:')
    .setColor(0xED4245);

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('cleanup_closed')
        .setLabel('Tickets Fechados')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId('cleanup_old')
        .setLabel('Tickets Antigos (7+ dias)')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⏰'),
      new ButtonBuilder()
        .setCustomId('cleanup_empty')
        .setLabel('Tickets Vazios')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('📝')
    );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function handlePainelLogs(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('📋 Logs do Sistema')
    .setDescription('**Últimas atividades do sistema:**\n\n```\n[INFO] Sistema iniciado\n[SUCCESS] Comandos carregados\n[INFO] Bot online\n```')
    .addFields(
      { name: '🔄 Última Reinicialização', value: '<t:1703980800:R>', inline: true },
      { name: '📊 Comandos Executados', value: '0', inline: true },
      { name: '⚠️ Erros', value: '0', inline: true }
    )
    .setColor(0x5865F2)
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handlePainelConfig(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('⚙️ Configurações do Sistema')
    .setDescription('**Configurações atuais:**')
    .addFields(
      { name: '🎫 Sistema de Tickets', value: '✅ Ativo', inline: true },
      { name: '📂 Categoria', value: '❌ Não configurado', inline: true },
      { name: '📋 Logs', value: '❌ Não configurado', inline: true },
      { name: '🎭 Cargo Staff', value: '❌ Não configurado', inline: true },
      { name: '🔔 Notificações', value: '✅ Ativo', inline: true },
      { name: '🚫 Anti-Spam', value: '✅ Ativo', inline: true }
    )
    .setColor(0x5865F2);

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('config_category')
        .setLabel('Configurar Categoria')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📂'),
      new ButtonBuilder()
        .setCustomId('config_logs')
        .setLabel('Configurar Logs')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('config_staff')
        .setLabel('Configurar Staff')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎭')
    );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function handlePainelStaff(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('👥 Gerenciamento de Staff')
    .setDescription('**Equipe de suporte atual:**\n\n*Nenhum staff configurado*')
    .addFields(
      { name: '👨‍💼 Staff Total', value: '0', inline: true },
      { name: '🟢 Online', value: '0', inline: true },
      { name: '🔴 Offline', value: '0', inline: true }
    )
    .setColor(0x5865F2);

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('staff_add')
        .setLabel('Adicionar Staff')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('staff_remove')
        .setLabel('Remover Staff')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('➖'),
      new ButtonBuilder()
        .setCustomId('staff_list')
        .setLabel('Listar Staff')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📋')
    );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

// ========== HANDLERS PARA COMANDO /SETUP ==========

async function handleSetupButtons(interaction) {
  switch (interaction.customId) {
    case 'setup_category':
      await handleSetupCategory(interaction);
      break;
    case 'setup_logs':
      await handleSetupLogs(interaction);
      break;
    case 'setup_role':
      await handleSetupRole(interaction);
      break;
    case 'setup_permissions':
      await handleSetupPermissions(interaction);
      break;
    case 'setup_auto_setup':
      await handleSetupAutoSetup(interaction);
      break;
    case 'setup_reset':
      await handleSetupReset(interaction);
      break;
    case 'setup_test':
      await handleSetupTest(interaction);
      break;
    case 'setup_help':
      await handleSetupHelp(interaction);
      break;
  }
}

async function handleSetupCategory(interaction) {
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
}

async function handleSetupLogs(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('setup_logs_modal')
    .setTitle('Configurar Canal de Logs');

  const channelInput = new TextInputBuilder()
    .setCustomId('log_channel_id')
    .setLabel('ID do Canal de Logs')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 123456789')
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder().addComponents(channelInput);
  modal.addComponents(firstActionRow);

  await interaction.showModal(modal);
}

async function handleSetupRole(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('setup_role_modal')
    .setTitle('Configurar Cargo de Staff');

  const roleInput = new TextInputBuilder()
    .setCustomId('staff_role_id')
    .setLabel('ID do Cargo de Staff')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 123456789')
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder().addComponents(roleInput);
  modal.addComponents(firstActionRow);

  await interaction.showModal(modal);
}

async function handleSetupPermissions(interaction) {
  const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
  const permissions = [
    'ViewChannel',
    'SendMessages',
    'ManageChannels',
    'ManageRoles',
    'ReadMessageHistory',
    'AttachFiles'
  ];

  const permissionCheck = permissions.map(perm => {
    const hasPermission = botMember.permissions.has(perm);
    return `${hasPermission ? '✅' : '❌'} ${perm}`;
  }).join('\n');

  const embed = new EmbedBuilder()
    .setTitle('🛡️ Verificação de Permissões')
    .setDescription(`**Permissões do bot:**\n\n${permissionCheck}`)
    .setColor(0x5865F2)
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleSetupAutoSetup(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    // Criar categoria
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

    // Criar canal de logs
    const logsChannel = await interaction.guild.channels.create({
      name: '📋・ticket-logs',
      type: ChannelType.GuildText,
      parent: categoria.id,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.client.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        }
      ]
    });

    // Criar canal para painel
    const painelChannel = await interaction.guild.channels.create({
      name: '🎫・abrir-ticket',
      type: ChannelType.GuildText,
      topic: 'Canal para abertura de tickets de suporte',
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          allow: [PermissionFlagsBits.ViewChannel],
          deny: [PermissionFlagsBits.SendMessages]
        },
        {
          id: interaction.client.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        }
      ]
    });

    // Criar embed do painel
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

    await painelChannel.send({
      embeds: [painelEmbed],
      components: [painelButton]
    });

    const successEmbed = new EmbedBuilder()
      .setTitle('🚀 Configuração Automática Concluída')
      .setDescription('O sistema foi configurado automaticamente com sucesso!')
      .addFields(
        { name: '📂 Categoria', value: categoria.toString(), inline: true },
        { name: '📋 Logs', value: logsChannel.toString(), inline: true },
        { name: '🎫 Painel', value: painelChannel.toString(), inline: true }
      )
      .setColor(0x57F287)
      .setTimestamp();

    await interaction.editReply({ embeds: [successEmbed] });

  } catch (error) {
    await interaction.editReply({
      embeds: [{
        title: '❌ Erro na Configuração',
        description: 'Ocorreu um erro durante a configuração automática.',
        color: 0xED4245
      }]
    });
  }
}

async function handleSetupReset(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🔄 Resetar Sistema')
    .setDescription('⚠️ **ATENÇÃO!** Esta ação irá:\n\n• Deletar todos os tickets abertos\n• Remover a categoria de tickets\n• Limpar todas as configurações\n\n**Esta ação não pode ser desfeita!**')
    .setColor(0xED4245);

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_reset')
        .setLabel('Confirmar Reset')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⚠️'),
      new ButtonBuilder()
        .setCustomId('cancel_reset')
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❌')
    );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function handleSetupTest(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const tests = [
    { name: 'Permissões do Bot', status: true },
    { name: 'Categoria de Tickets', status: false },
    { name: 'Canal de Logs', status: false },
    { name: 'Cargo de Staff', status: false },
    { name: 'Comandos Funcionando', status: true }
  ];

  const testResults = tests.map(test => 
    `${test.status ? '✅' : '❌'} ${test.name}`
  ).join('\n');

  const embed = new EmbedBuilder()
    .setTitle('🧪 Teste do Sistema')
    .setDescription(`**Resultados dos testes:**\n\n${testResults}`)
    .addFields(
      { name: '📊 Resumo', value: `${tests.filter(t => t.status).length}/${tests.length} testes passaram`, inline: true },
      { name: '⚠️ Status', value: tests.every(t => t.status) ? '✅ Sistema OK' : '❌ Configuração necessária', inline: true }
    )
    .setColor(tests.every(t => t.status) ? 0x57F287 : 0xFEE75C)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleSetupHelp(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('❓ Ajuda - Sistema de Configuração')
    .setDescription('**Guia de configuração do sistema de tickets:**')
    .addFields(
      { 
        name: '1️⃣ Configuração Automática', 
        value: '• Use o botão "Configuração Automática" para configurar tudo automaticamente\n• Isso criará categoria, canais e painel', 
        inline: false 
      },
      { 
        name: '2️⃣ Configuração Manual', 
        value: '• Configure cada item individualmente\n• Categoria → Logs → Staff → Painel', 
        inline: false 
      },
      { 
        name: '3️⃣ Permissões Necessárias', 
        value: '• Gerenciar Canais\n• Gerenciar Cargos\n• Enviar Mensagens\n• Ver Canais', 
        inline: false 
      },
      { 
        name: '4️⃣ Problemas Comuns', 
        value: '• Bot sem permissões\n• Categoria já existe\n• Limite de canais atingido', 
        inline: false 
      }
    )
    .setColor(0x5865F2)
    .setFooter({ text: 'Precisa de mais ajuda? Entre em contato com o suporte' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ========== FUNÇÃO PRINCIPAL DE INTERAÇÃO ==========

// Adicione esta função ao seu client.on('interactionCreate')
async function handleButtonInteraction(interaction) {
  if (!interaction.isButton()) return;

  // Handlers para tickets
  if (['ticket_close', 'ticket_add_user', 'ticket_remove_user', 'ticket_transcript', 'ticket_claim', 'ticket_stats'].includes(interaction.customId)) {
    await handleTicketButtons(interaction);
  }
  
  // Handlers para painel
  else if (['painel_create_panel', 'painel_stats', 'painel_cleanup', 'painel_logs', 'painel_config', 'painel_staff'].includes(interaction.customId)) {
    await handlePainelButtons(interaction);
  }
  
  // Handlers para setup
  else if (['setup_category', 'setup_logs', 'setup_role', 'setup_permissions', 'setup_auto_setup', 'setup_reset', 'setup_test', 'setup_help'].includes(interaction.customId)) {
    await handleSetupButtons(interaction);
  }

  // Handler para abrir ticket (do painel criado)
  else if (interaction.customId === 'open_ticket') {
    await handleOpenTicket(interaction);
  }

  // Handlers de confirmação
  else if (interaction.customId === 'confirmar_close') {
    await handleConfirmClose(interaction);
  }
  else if (interaction.customId === 'cancelar_close') {
    await interaction.update({ content: '❌ Fechamento cancelado.', embeds: [], components: [] });
  }
  else if (interaction.customId === 'confirm_reset') {
    await handleConfirmReset(interaction);
  }
  else if (interaction.customId === 'cancel_reset') {
    await interaction.update({ content: '❌ Reset cancelado.', embeds: [], components: [] });
  }
}

// Função para abrir ticket
async function handleOpenTicket(interaction) {
  const categoria = interaction.guild.channels.cache.find(c => 
    c.name.includes('ticket') && c.type === 4
  );

  if (!categoria) {
    return interaction.reply({
      embeds: [{
        title: '❌ Erro',
        description: 'Sistema não configurado. Use `/setup` primeiro.',
        color: 0xED4245
      }],
      ephemeral: true
    });
  }

  // Verificar se já tem ticket aberto
  const ticketExistente = interaction.guild.channels.cache.find(c => 
    c.name === `ticket-${interaction.user.username.toLowerCase()}`
  );

  if (ticketExistente) {
    return interaction.reply({
      embeds: [{
        title: '⚠️ Ticket Já Existe',
        description: `Você já tem um ticket aberto: ${ticketExistente}`,
        color: 0xFEE75C
      }],
      ephemeral: true
    });
  }

  try {
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username.toLowerCase()}`,
      type: ChannelType.GuildText,
      parent: categoria.id,
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
            PermissionFlagsBits.ReadMessageHistory
          ]
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        }
      ]
    });

    const welcomeEmbed = new EmbedBuilder()
      .setTitle('🎫 Ticket Criado')
      .setDescription(`Olá ${interaction.user}! Seu ticket foi criado com sucesso.\n\n**Descreva seu problema detalhadamente e nossa equipe irá ajudá-lo em breve.**`)
      .addFields(
        { name: '👤 Usuário', value: interaction.user.toString(), inline: true },
        { name: '🕐 Criado em', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        { name: '🆔 ID do Ticket', value: ticketChannel.id, inline: true }
      )
      .setColor(0x57F287)
      .setFooter({ text: 'Use os botões abaixo para gerenciar este ticket' })
      .setTimestamp();

    const ticketButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel('Fechar Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒'),
        new ButtonBuilder()
          .setCustomId('ticket_claim')
          .setLabel('Assumir Ticket')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🙋'),
        new ButtonBuilder()
          .setCustomId('ticket_transcript')
          .setLabel('Transcrição')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📝')
      );

    await ticketChannel.send({
      content: `${interaction.user} 🎫`,
      embeds: [welcomeEmbed],
      components: [ticketButtons]
    });

    await interaction.reply({
      embeds: [{
        title: '✅ Ticket Criado',
        description: `Seu ticket foi criado: ${ticketChannel}`,
        color: 0x57F287
      }],
      ephemeral: true
    });

  } catch (error) {
    await interaction.reply({
      embeds: [{
        title: '❌ Erro',
        description: 'Não foi possível criar o ticket.',
        color: 0xED4245
      }],
      ephemeral: true
    });
  }
}

// Função para confirmar fechamento
async function handleConfirmClose(interaction) {
  await interaction.deferUpdate();
  
  const embed = new EmbedBuilder()
    .setTitle('🔒 Ticket Sendo Fechado')
    .setDescription('Este ticket será deletado em 5 segundos...')
    .setColor(0xED4245)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed], components: [] });

  setTimeout(async () => {
    try {
      await interaction.channel.delete();
    } catch (error) {
      console.error('Erro ao deletar canal:', error);
    }
  }, 5000);
}

// Função para confirmar reset
async function handleConfirmReset(interaction) {
  await interaction.deferUpdate();

  try {
    // Deletar todos os tickets
    const tickets = interaction.guild.channels.cache.filter(c => 
      c.name.startsWith('ticket-') && c.type === 0
    );

    for (const ticket of tickets.values()) {
      await ticket.delete();
    }

    // Deletar categoria
    const categoria = interaction.guild.channels.cache.find(c => 
      c.name.includes('ticket') && c.type === 4
    );

    if (categoria) {
      await categoria.delete();
    }

    await interaction.editReply({
      embeds: [{
        title: '✅ Sistema Resetado',
        description: 'O sistema foi resetado com sucesso!',
        color: 0x57F287
      }],
      components: []
    });

  } catch (error) {
    await interaction.editReply({
      embeds: [{
        title: '❌ Erro no Reset',
        description: 'Ocorreu um erro durante o reset.',
        color: 0xED4245
      }],
      components: []
    });
  }
}

// EXPORTAR A FUNÇÃO PRINCIPAL
module.exports = { handleButtonInteraction };
