const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // Handler para menu de seleção de tickets
      if (interaction.isStringSelectMenu() && interaction.customId === 'menu_ticket') {
        const tipo = interaction.values[0];
        
        // Verifica se usuário já tem ticket aberto
        const existing = interaction.guild.channels.cache.find(c => 
          c.topic === interaction.user.id && c.name.startsWith('ticket-')
        );
        
        if (existing) {
          return interaction.reply({ 
            content: `❌ Você já possui um ticket aberto: ${existing}`, 
            ephemeral: true 
          });
        }

        // Procura ou cria categoria de tickets
        let category = interaction.guild.channels.cache.find(c => 
          c.name === 'tickets' && c.type === ChannelType.GuildCategory
        );
        
        if (!category) {
          try {
            category = await interaction.guild.channels.create({
              name: 'tickets',
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

        // Cria o canal do ticket
        const channel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.username}`.toLowerCase(),
          type: ChannelType.GuildText,
          topic: interaction.user.id,
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
                PermissionFlagsBits.ReadMessageHistory
              ] 
            }
          ]
        });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('fechar_ticket')
            .setLabel('🔒 Fechar Ticket')
            .setStyle(ButtonStyle.Secondary)
        );

        const embed = new EmbedBuilder()
          .setTitle('🎫 Ticket Criado')
          .setDescription(`**Tipo:** ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          
**Usuário:** ${interaction.user}
**ID:** ${interaction.user.id}

📝 Descreva seu problema ou solicitação e nossa equipe responderá em breve.`)
          .setColor(0x57F287)
          .setFooter({ text: 'Use o botão abaixo para fechar o ticket quando necessário.' })
          .setTimestamp();

        await channel.send({ 
          content: `${interaction.user} | Ticket criado com sucesso!`, 
          embeds: [embed], 
          components: [row] 
        });
        
        await interaction.reply({ 
          content: `✅ Seu ticket foi criado: ${channel}`, 
          ephemeral: true 
        });
      }

      // Handler para botões
      if (interaction.isButton()) {
        if (interaction.customId === 'fechar_ticket') {
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('confirmar_delete')
              .setLabel('❌ Deletar')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('reabrir_ticket')
              .setLabel('🔓 Reabrir')
              .setStyle(ButtonStyle.Success)
          );
          
          const embed = new EmbedBuilder()
            .setTitle('🔒 Ticket Fechado')
            .setDescription('Este ticket foi fechado. Escolha uma opção abaixo:')
            .setColor(0xED4245)
            .setTimestamp();
            
          await interaction.update({ embeds: [embed], components: [row] });
          
        } else if (interaction.customId === 'confirmar_delete') {
          const canal = interaction.channel;
          
          const embed = new EmbedBuilder()
            .setTitle('🗑️ Deletando Ticket')
            .setDescription('Este ticket será deletado em **5 segundos**...')
            .setColor(0xED4245);
            
          await interaction.update({ embeds: [embed], components: [] });
          
          setTimeout(() => {
            canal.delete().catch(error => {
              console.error('Erro ao deletar canal:', error);
            });
          }, 5000);
          
        } else if (interaction.customId === 'reabrir_ticket') {
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('fechar_ticket')
              .setLabel('🔒 Fechar Ticket')
              .setStyle(ButtonStyle.Secondary)
          );
          
          const embed = new EmbedBuilder()
            .setTitle('🔓 Ticket Reaberto')
            .setDescription('Este ticket foi reaberto com sucesso!')
            .setColor(0x57F287)
            .setTimestamp();
            
          await interaction.update({ embeds: [embed], components: [row] });
        }
      }
    } catch (error) {
      console.error('Erro no handler de interação:', error);
      
      const errorMessage = {
        content: '❌ Ocorreu um erro ao processar sua solicitação!',
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
