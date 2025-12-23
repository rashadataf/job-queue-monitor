import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import type { AppConfig } from './config/app.config';
import { ConfigNamespace } from './config/config-names.enum';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    const configService = app.get(ConfigService);
    const appConfig = configService.get<AppConfig>(ConfigNamespace.App);

    if (!appConfig) {
        throw new Error('Application configuration is not defined');
    }

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.listen(appConfig.port, '0.0.0.0');
}
bootstrap();
