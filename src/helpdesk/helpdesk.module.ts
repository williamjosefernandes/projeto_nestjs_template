import { Module } from '@nestjs/common';
import { HelpdeskService } from './helpdesk.service';
import { HelpdeskController } from './helpdesk.controller';
import { PrismaService } from '../database/prisma.service';
import { GuardsModule } from '../auth/guards/guards.module';

@Module({
  imports: [GuardsModule],
  controllers: [HelpdeskController],
  providers: [HelpdeskService, PrismaService],
  exports: [HelpdeskService],
})
export class HelpdeskModule {}