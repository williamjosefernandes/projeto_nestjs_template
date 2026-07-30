import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to Prisma...');
    await this.$connect();
    
    // Optional: Log queries in development
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore - Prisma types workaround for events
      this.$on('query', (e: any) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
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
