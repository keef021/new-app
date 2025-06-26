const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Configuração do servidor web para Render
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    status: 'Bot Discord rodando',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    bot: client.user ? 'online' : 'offline',
    guilds: client.guilds.cache.size
  });
});

// Inicializa o cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// Coleção para armazenar comandos
client.commands = new Collection();

// Função para carregar comandos
function loadCommands() {
  try {
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    console.log(`Carregando ${commandFiles.length} comandos...`);
    
    for (const file of commandFiles) {
      try {
        delete require.cache[require.resolve(`./commands/${file}`)];
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
        console.log(`✅ Comando carregado: ${command.data.name}`);
      } catch (error) {
        console.error(`❌ Erro ao carregar comando ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao ler diretório de comandos:', error);
  }
}

// Função para carregar eventos
function loadEvents() {
  try {
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    console.log(`Carregando ${eventFiles.length} eventos...`);
    
    for (const file of eventFiles) {
      try {
        delete require.cache[require.resolve(`./events/${file}`)];
        const event = require(`./events/${file}`);
        client.on(event.name, (...args) => event.execute(...args, client));
        console.log(`✅ Evento carregado: ${event.name}`);
      } catch (error) {
        console.error(`❌ Erro ao carregar evento ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao ler diretório de eventos:', error);
  }
}

// Carrega comandos e eventos
loadCommands();
loadEvents();

// Handler para interações de comandos
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  
  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(`Erro ao executar comando ${interaction.commandName}:`, error);
    
    const errorMessage = {
      content: 'Houve um erro ao executar este comando!',
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
});

// Evento quando o bot fica online
client.once('ready', () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
  console.log(`📊 Conectado em ${client.guilds.cache.size} servidor(s)`);
  console.log(`👥 Usuários alcançados: ${client.users.cache.size}`);
});

// Tratamento de erros
client.on('error', error => {
  console.error('Erro do cliente Discord:', error);
});

client.on('warn', warning => {
  console.warn('Aviso do cliente Discord:', warning);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Inicia o servidor web
app.listen(PORT, () => {
  console.log(`🌐 Servidor web rodando na porta ${PORT}`);
});

// Faz login no Discord
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ Token do Discord não encontrado! Configure a variável de ambiente DISCORD_TOKEN');
  process.exit(1);
}

client.login(token).catch(error => {
  console.error('❌ Erro ao fazer login:', error);
  process.exit(1);
});
