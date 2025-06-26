const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const foldersPath = path.join(__dirname, 'commands');

// Verificar se o diretório de comandos existe
if (!fs.existsSync(foldersPath)) {
  console.error('❌ Diretório "commands" não encontrado!');
  process.exit(1);
}

// Carregar todos os comandos
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));

console.log(`📁 Carregando ${commandFiles.length} comandos...`);

for (const file of commandFiles) {
  const filePath = path.join(foldersPath, file);
  
  try {
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      console.log(`✅ ${command.data.name} - ${command.data.description}`);
    } else {
      console.log(`⚠️ ${file} - Comando sem propriedades "data" ou "execute"`);
    }
  } catch (error) {
    console.error(`❌ Erro ao carregar ${file}:`, error.message);
  }
}

if (commands.length === 0) {
  console.error('❌ Nenhum comando válido encontrado!');
  process.exit(1);
}

// Configurar REST
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`\n🚀 Iniciando deploy de ${commands.length} comandos...`);

    // Para desenvolvimento: registrar comandos em guild específica (instantâneo)
    if (process.env.GUILD_ID) {
      console.log('📍 Registrando comandos no servidor de desenvolvimento...');
      
      const data = await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );

      console.log(`✅ ${data.length} comandos registrados no servidor!`);
    }

    // Para produção: registrar comandos globalmente (demora até 1 hora)
    if (process.env.NODE_ENV === 'production') {
      console.log('🌐 Registrando comandos globalmente...');
      
      const data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
      );

      console.log(`✅ ${data.length} comandos registrados globalmente!`);
    }

    console.log('\n🎉 Deploy concluído com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro durante o deploy:', error);
    
    if (error.code === 50001) {
      console.error('💡 Verifique se o bot tem permissões adequadas no servidor.');
    } else if (error.code === 401) {
      console.error('💡 Token inválido. Verifique a variável DISCORD_TOKEN.');
    } else if (error.rawError?.message?.includes('application')) {
      console.error('💡 Verifique se CLIENT_ID está correto.');
    }
  }
})();
