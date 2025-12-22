import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { DatabaseConfig } from '../config/database.config';
import { ConfigNamespace } from '../config/config-names.enum';
import { Job } from '../jobs/entities/job.entity';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const db = configService.get<DatabaseConfig>(
                    ConfigNamespace.Database,
                );

                if (!db) {
                    throw new Error('Database configuration is not defined');
                }

                return {
                    type: 'postgres' as const,
                    host: db.host,
                    port: db.port,
                    database: db.name,
                    username: db.user,
                    password: db.password,
                    entities: [Job],
                    synchronize: true,
                    logging: false,
                };
            },
        }),
    ],
})
export class DatabaseModule {}
