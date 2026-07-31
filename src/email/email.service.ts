import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { passwordTemplate } from '../templates/password-reset-template';
import { emailConfirmTemplate } from '../templates/email-confirm-template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transport: Transporter;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): Transporter {
    if (!this.transport) {
      this.transport = nodemailer.createTransport({
        host: this.configService.getOrThrow<string>('smtp.host'),
        port: this.configService.getOrThrow<number>('smtp.port'),
        secure: this.configService.get<boolean>('smtp.secure'),
        auth: {
          user: this.configService.getOrThrow<string>('smtp.user'),
          pass: this.configService.getOrThrow<string>('smtp.password'),
        },
        tls: {
          ciphers: 'SSLv3',
        },
      });

      this.transport.on('error', (error) => {
        this.logger.error(
          'Erro no transporte SMTP',
          error instanceof Error ? error.stack : String(error),
        );
      });
    }

    return this.transport;
  }

  async sendVerificationCode(
    name: string,
    email: string,
    code: string,
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Código de Verificação',
      html: emailConfirmTemplate(name, email, code),
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
  }): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Redefinição de senha',
      html: passwordTemplate(url, name),
    });
  }

  private async send(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<boolean> {
    const from = this.configService.get<string>('smtp.from');

    try {
      await this.getClient().sendMail({ from, ...options });
      return true;
    } catch (error) {
      this.logger.error(
        `Falha ao enviar e-mail para ${options.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
