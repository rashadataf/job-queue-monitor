import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import type { AppConfig } from './config/app.config';
import { ConfigNamespace } from './config/config-names.enum';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const appConfig = configService.get<AppConfig>(ConfigNamespace.App);

    if (!appConfig) {
        throw new Error('Application configuration is not defined');
    }

    await app.listen(appConfig.port);
}
bootstrap();
