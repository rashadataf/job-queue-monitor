import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsProcessor } from './jobs.processor';
import { JobsGateway } from './jobs.gateway';
import { Job } from './entities/job.entity';
import { ConfigNamespace } from '../config/config-names.enum';
import { RedisConfig } from '../config/redis.config';
import { JOB_QUEUE_NAME } from './jobs.constants';

@Module({
    imports: [
        TypeOrmModule.forFeature([Job]),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const redis = configService.get<RedisConfig>(
                    ConfigNamespace.Redis,
                );

                if (!redis) {
                    throw new Error('Redis configuration is not defined');
                }

                return {
                    connection: {
                        host: redis.host,
                        port: redis.port,
                    },
                };
            },
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: JOB_QUEUE_NAME,
            defaultJobOptions: {
                attempts: 1, // We handle retries manually
                removeOnComplete: false,
                removeOnFail: false,
            },
        }),
    ],
    controllers: [JobsController],
    providers: [JobsService, JobsProcessor, JobsGateway],
    exports: [JobsService],
})
export class JobsModule {}
