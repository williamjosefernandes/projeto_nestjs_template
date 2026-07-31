import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { passwordTemplate } from 'src/templates/password-reset-template';
import { emailConfirmTemplate } from 'src/templates/email-confirm-template';
import { BcryptService } from '../common/service/bcrypt.service';
import { PrismaService } from '../database/prisma.service';
import { ErrorCode } from '../common/enum/error-code.enum';
import { InternalServerErrorAppException } from '../common/exceptions/app.exception';

@Injectable()
export class EmailService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  private async getClient() {
    const transport = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: 'contact@wjfdeveloper.com.br',
        pass: '&Jfw130291',
      },
      tls: {
        ciphers: 'SSLv3',
      },
    });

    transport.on('error', (error) => {
      throw new InternalServerErrorAppException(ErrorCode.EMAIL_DELIVERY_FAILED, { cause: String(error) });
    });

    return transport;
  }

  async sendVerificationCode(name: string, email: string, code: string) {
    const client = await this.getClient();

    client
      .sendMail({
        from: 'MadeCoders <contact@wjfdeveloper.com.br>',
        to: email,
        subject: 'Código de Verificação',
        html: emailConfirmTemplate(name, email, code),
      })
      .catch((error) => {
        console.error('Erro ao enviar email:', error);
      });
  }

  async resetPassword({
                        url,
                        name,
                        email,
                      }: {
    url: string;
    name: string;
    email: string;
  }) {
    const client = await this.getClient();

    client
      .sendMail({
        from: 'MadeCoders <contact@wjfdeveloper.com.br>',
        to: email,
        subject: 'Redefinição de senha',
        html: passwordTemplate(url, name),
      })
      .catch((error) => {
        console.error('Erro ao enviar email:', error);
      });
  }
}
