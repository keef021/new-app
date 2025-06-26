const { Client, GatewayIntentBits, Collection, Partials, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Configuração do servidor web
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: 'Bot Discord Online',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    bot: client.user ? 'online' : 'offline',
    guilds: client.guilds?.cache.size || 0,
    ping: client.ws.ping
  });
});

app.get('/stats', (req, res) => {
  if (!client.user) return res.status(503).json({ error: 'Bot offline' });
  
  res.json({
    guilds: client.guilds.cache.size,
    users: client.users.cache.size,
    channels: client.channels.cache.size,
    uptime: Math.floor(process.uptime()),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
  });
});

// Cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Sistema de logs
const log = {
  info: (msg) => console.log(`[INFO] ${new Date().toLocaleString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toLocaleString()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toLocaleString()} - ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${new Date().toLocaleString()} - ${msg}`)
};

// Carregar comandos
function loadCommands() {
  const commands = [];
  
  try {
    if (!fs.existsSync('./commands')) {
      fs.mkdirSync('./commands', { recursive: true });
      log.warn('Diretório commands criado');
    }
    
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    
    if (commandFiles.length === 0) {
      log.warn('Nenhum comando encontrado');
      return [];
    }
    
    log.info(`Carregando ${commandFiles.length} comandos...`);
    
    for (const file of commandFiles) {
      try {
        const filePath = path.join(__dirname, 'commands', file);
        delete require.cache[require.resolve(filePath)];
        
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          commands.push(command.data.toJSON());
          log.success(`Comando carregado: ${command.data.name}`);
        } else {
          log.warn(`Comando ${file} está faltando propriedades obrigatórias`);
        }
      } catch (error) {
        log.error(`Erro ao carregar comando ${file}: ${error.message}`);
      }
    }
  } catch (error) {
    log.error(`Erro ao ler diretório de comandos: ${error.message}`);
  }
  
  return commands;
}

// Carregar eventos
function loadEvents() {
  try {
    if (!fs.existsSync('./events')) {
      fs.mkdirSync('./events', { recursive: true });
      log.warn('Diretório events criado');
    }
    
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    
    if (eventFiles.length === 0) {
      log.warn('Nenhum evento encontrado');
      return;
    }
    
    log.info(`Carregando ${eventFiles.length} eventos...`);
    
    for (const file of eventFiles) {
      try {
        const filePath = path.join(__dirname, 'events', file);
        delete require.cache[require.resolve(filePath)];
        
        const event = require(filePath);
        
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
        
        log.success(`Evento carregado: ${event.name}`);
      } catch (error) {
        log.error(`Erro ao carregar evento ${file}: ${error.message}`);
      }
    }
  } catch (error) {
    log.error(`Erro ao ler diretório de eventos: ${error.message}`);
  }
}

// Registrar comandos slash
async function deployCommands() {
  const commands = loadCommands();
  
  if (commands.length === 0) {
    log.warn('Nenhum comando para registrar');
    return;
  }
  
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  
  try {
    log.info('Registrando comandos slash...');
    
    // Registra globalmente (demora até 1 hora)
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    // Se tiver guild específica, registra lá também (instantâneo)
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
        { body: commands }
      );
    }
    
    log.success(`${commands.length} comandos registrados com sucesso`);
  } catch (error) {
    log.error(`Erro ao registrar comandos: ${error.message}`);
  }
}

// Sistema de cooldown
function checkCooldown(userId, commandName) {
  const cooldowns = client.cooldowns;
  
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection());
  }
  
  const now = Date.now();
  const timestamps = cooldowns.get(commandName);
  const cooldownAmount = 3000; // 3 segundos
  
  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownAmount;
    
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return timeLeft;
    }
  }
  
  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
  
  return false;
}

// Handler de interações
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  
  // Verificar cooldown
  const cooldownTime = checkCooldown(interaction.user.id, interaction.commandName);
  if (cooldownTime) {
    return interaction.reply({
      content: `⏱️ Aguarde ${cooldownTime.toFixed(1)}s antes de usar este comando novamente.`,
      ephemeral: true
    });
  }
  
  try {
    await command.execute(interaction, client);
    log.info(`Comando ${interaction.commandName} executado por ${interaction.user.tag}`);
  } catch (error) {
    log.error(`Erro no comando ${interaction.commandName}: ${error.message}`);
    
    const errorEmbed = {
      embeds: [{
        title: '❌ Erro',
        description: 'Houve um erro ao executar este comando.',
        color: 0xED4245,
        timestamp: new Date().toISOString()
      }]
    };
    
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ ...errorEmbed, ephemeral: true });
      } else {
        await interaction.reply({ ...errorEmbed, ephemeral: true });
      }
    } catch (followUpError) {
      log.error(`Erro ao enviar mensagem de erro: ${followUpError.message}`);
    }
  }
});

// Evento ready
client.once('ready', async () => {
  log.success(`Bot online: ${client.user.tag}`);
  log.info(`Servidores: ${client.guilds.cache.size}`);
  log.info(`Usuários: ${client.users.cache.size}`);
  
  // Registrar comandos após estar online
  await deployCommands();
  
  // Status do bot
  client.user.setActivity('Sistema de Tickets', { type: 'WATCHING' });
});

// Carregar eventos
loadEvents();

// Tratamento de erros
client.on('error', error => log.error(`Cliente Discord: ${error.message}`));
client.on('warn', warning => log.warn(`Cliente Discord: ${warning}`));

process.on('unhandledRejection', (reason, promise) => {
  log.error(`Unhandled Rejection: ${reason}`);
});

process.on('uncaughtException', (error) => {
  log.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  log.info('Recebido SIGINT, desligando...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log.info('Recebido SIGTERM, desligando...');
  client.destroy();
  process.exit(0);
});

// Iniciar servidor web
app.listen(PORT, () => {
  log.info(`Servidor web rodando na porta ${PORT}`);
});

// Login no Discord
const token = process.env.DISCORD_TOKEN;
if (!token) {
  log.error('Token do Discord não encontrado! Configure DISCORD_TOKEN');
  process.exit(1);
}

client.login(token).catch(error => {
  log.error(`Erro ao fazer login: ${error.message}`);
  process.exit(1);
});

module.exports = client;
