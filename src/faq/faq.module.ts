import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { PrismaService } from '../database/prisma.service';
import { GuardsModule } from '../auth/guards/guards.module';

@Module({
  imports: [GuardsModule],
  controllers: [FaqController],
  providers: [FaqService, PrismaService],
  exports: [FaqService],
})
export class FaqModule {}