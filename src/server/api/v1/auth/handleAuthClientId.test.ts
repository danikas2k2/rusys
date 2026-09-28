import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleAuthClientId } from '~/server/api/v1/auth/handleAuthClientId';

async function clientId() {
    return runApiHandler(new NextRequest('http://localhost/api/v1/auth/client-id'), handleAuthClientId);
}

describe('handleAuthClientId', () => {
    afterEach(() => vi.unstubAllEnvs());

    it('returns the configured client ID in production', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('GOOGLE_CLIENT_ID', 'production-client');

        await expect((await clientId()).json()).resolves.toStrictEqual({ clientId: 'production-client' });
    });

    it('rejects production requests when the client ID is missing', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('GOOGLE_CLIENT_ID', undefined);

        const response = await clientId();

        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'CONFIGURATION_ERROR' } });
    });

    it('uses the development client ID when no production ID is configured', async () => {
        vi.stubEnv('NODE_ENV', 'test');
        vi.stubEnv('GOOGLE_CLIENT_ID', undefined);

        await expect((await clientId()).json()).resolves.toStrictEqual({ clientId: 'dev-mode' });
    });

    it('prefers a configured ID in development', async () => {
        vi.stubEnv('NODE_ENV', 'test');
        vi.stubEnv('GOOGLE_CLIENT_ID', 'configured-client');

        await expect((await clientId()).json()).resolves.toStrictEqual({ clientId: 'configured-client' });
    });
});
