import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { DatabaseConfig } from '../config/database.config';
import { ConfigNamespace } from '../config/config-names.enum';

@Module({
    imports: [
        ConfigModule,
        SequelizeModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (
                configService: ConfigService,
            ): Parameters<typeof SequelizeModule.forRoot>[0] => {
                const db = configService.get<DatabaseConfig>(
                    ConfigNamespace.Database,
                );

                if (!db) {
                    throw new Error('Database configuration is not defined');
                }

                return {
                    dialect: 'postgres',
                    host: db.host,
                    port: db.port,
                    database: db.name,
                    username: db.user,
                    password: db.password,
                    models: [],
                    autoLoadModels: true,
                    synchronize: true,
                    logging: false,
                };
            },
        }),
    ],
})
export class DatabaseModule {}
