import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from './config-names.enum';

export type AppConfig = {
    port: number;
    corsOrigin: string | string[];
};

export default registerAs(ConfigNamespace.App, (): AppConfig => {
    const portRaw = process.env.PORT ?? '3000';
    const port = Number(portRaw);

    if (!Number.isFinite(port) || port <= 0) {
        throw new Error(`Invalid PORT value: "${portRaw}"`);
    }

    const corsOrigin = process.env.CORS_ORIGIN ?? '*';

    return {
        port,
        corsOrigin: corsOrigin.includes(',')
            ? corsOrigin.split(',')
            : corsOrigin,
    };
});
