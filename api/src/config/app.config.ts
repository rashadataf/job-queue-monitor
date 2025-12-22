import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from './config-names.enum';

export type AppConfig = {
    port: number;
};

export default registerAs(ConfigNamespace.App, (): AppConfig => {
    const portRaw = process.env.PORT ?? '3000';
    const port = Number(portRaw);

    if (!Number.isFinite(port) || port <= 0) {
        throw new Error(`Invalid PORT value: "${portRaw}"`);
    }

    return {
        port,
    };
});
