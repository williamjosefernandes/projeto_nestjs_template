import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ] satisfies Prisma.LogDefinition[],
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to Prisma...');
    await this.$connect();

    if (this.configService.get<string>('app.nodeEnv') === 'development') {
      this.$on('query', (event: Prisma.QueryEvent) => {
        this.logger.debug(`Query: ${event.query}`);
        this.logger.debug(`Duration: ${event.duration}ms`);
      });
    }

    this.logger.log('Connected to Prisma successfully');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from Prisma...');
    await this.$disconnect();
    this.logger.log('Disconnected from Prisma successfully');
  }
}
