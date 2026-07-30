import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';

export class GenericAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private allowedProfile: string,
    private isGeneric: boolean,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new AppException('TOKEN_AUSENTE');
    }

    const authToken = await this.prismaService.refreshToken.findUnique({
      where: { token },
    });

    if (!authToken) {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: authToken.userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (!this.isGeneric && (!user.role || user.role !== this.allowedProfile)) {
      throw new AppException('INVALID_PROFILE');
    }

    request['user'] = user;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return undefined;
    }

    const [type, token] = authorizationHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  }
}
