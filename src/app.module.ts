import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HelpdeskModule } from './helpdesk/helpdesk.module';
import { FaqModule } from './faq/faq.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    HelpdeskModule,
    FaqModule,
    SettingsModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}