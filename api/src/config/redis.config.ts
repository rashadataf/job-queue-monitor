import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from './config-names.enum';

export type RedisConfig = {
    host: string;
    port: number;
};

export default registerAs(
    ConfigNamespace.Redis,
    (): RedisConfig => ({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    }),
);
