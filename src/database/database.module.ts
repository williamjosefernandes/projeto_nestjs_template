import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global para que `PrismaService` tenha uma única instância/pool de conexão
 * em toda a aplicação — antes era registrado localmente em 6+ módulos.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
