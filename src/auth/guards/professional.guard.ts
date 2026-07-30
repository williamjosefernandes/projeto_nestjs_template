import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GenericAuthGuard } from './generic-auth.guard';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProfessionalGuard extends GenericAuthGuard {
  constructor(
    @Inject(JwtService) jwtService: JwtService,
    @Inject(PrismaService) prismaService: PrismaService,
  ) {
    super(jwtService, 'PROFESSIONAL', false, prismaService);
  }
}
