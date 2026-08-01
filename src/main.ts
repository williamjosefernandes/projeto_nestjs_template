import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  app.use(helmet());

  const corsOrigins = configService.get<string[]>('app.corsOrigins') ?? [];
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // AllExceptionsFilter e TransformInterceptor são registrados via APP_FILTER/APP_INTERCEPTOR
  // em AppModule.

  const config = new DocumentBuilder()
    .setTitle('API MadeCoders')
    .setDescription(
      [
        'API Backend do MadeCoders.',
        '',
        'Todas as respostas seguem o envelope `{ success, timestamp, message, messageCode, data?, error?, requestId }`.',
        'Use `messageCode`/`error.code` para lógica de cliente — nunca faça parsing do texto de `message`.',
        'Rotas administrativas de contas exigem o header `x-account-id` com o Membership ativo.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication')
    .addTag('Identity / Users')
    .addTag('Onboarding')
    .addTag('Geografia')
    .addTag('Perguntas Frequentes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('app.port');
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs at: http://localhost:${port}/api/docs`);
}
bootstrap();
