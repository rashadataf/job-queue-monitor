import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from './config-names.enum';

export type DatabaseConfig = {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
};

export default registerAs(ConfigNamespace.Database, (): DatabaseConfig => {
    const host = process.env.DB_HOST ?? 'localhost';
    const portRaw = process.env.DB_PORT ?? '5432';
    const name = process.env.DB_NAME ?? 'job_queue_monitor';
    const user = process.env.DB_USER ?? 'job_queue_monitor';
    const password = process.env.DB_PASSWORD ?? 'job_queue_monitor';

    const port = Number(portRaw);

    if (!Number.isFinite(port) || port <= 0) {
        throw new Error(`Invalid DB_PORT value: "${portRaw}"`);
    }

    return {
        host,
        port,
        name,
        user,
        password,
    };
});
