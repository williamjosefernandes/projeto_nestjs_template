const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');

try {
  // Cria a pasta de migrações se não existir
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  console.log('🔄 Criando migração automática...');
  execSync('npx prisma migrate dev --name auto_migration', { stdio: 'inherit' });

  console.log('✅ Migração criada e aplicada com sucesso!');
} catch (error) {
  console.error('❌ Erro ao executar migração:', error.message);
  process.exit(1);
}
