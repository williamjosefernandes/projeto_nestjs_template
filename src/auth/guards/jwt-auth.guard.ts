import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { GenericAuthGuard } from './generic-auth.guard';

@Injectable()
export class JwtAuthGuard extends GenericAuthGuard {
  constructor(jwtService: JwtService, prismaService: PrismaService) {
    super(jwtService, '', true, prismaService);
  }
}
