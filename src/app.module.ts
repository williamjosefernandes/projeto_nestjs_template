import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FaqModule } from './faq/faq.module';
import { SecurityModule } from './core/security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    FaqModule,
    SecurityModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}