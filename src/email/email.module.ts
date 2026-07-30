import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaService } from '../database/prisma.service';
import { BcryptService } from '../common/service/bcrypt.service';

@Module({
  providers: [EmailService, PrismaService, BcryptService],
  exports: [EmailService],
})
export class EmailModule {}
