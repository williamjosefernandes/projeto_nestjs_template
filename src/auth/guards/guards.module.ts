import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { CompanyGuard } from './company.guard';
import { ProfessionalGuard } from './professional.guard';
import { GenericAuthGuard } from './generic-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '15m') as any;
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    PrismaService,
    JwtAuthGuard,
    AdminGuard,
    CompanyGuard,
    ProfessionalGuard,
  ],
  exports: [
    JwtModule,
    JwtAuthGuard,
    AdminGuard,
    CompanyGuard,
    ProfessionalGuard,
  ],
})
export class GuardsModule {}
