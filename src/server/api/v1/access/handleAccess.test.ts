import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleAccess } from '~/server/api/v1/access/handleAccess';

async function access(query = '') {
    return runApiHandler(new NextRequest(`http://localhost/api/v1/access${query}`), handleAccess);
}

describe('handleAccess', () => {
    afterEach(() => vi.unstubAllEnvs());

    it('requires exactly one email query value', async () => {
        expect((await access()).status).toBe(400);
        expect((await access('?email=one@example.com&email=two@example.com')).status).toBe(400);
    });

    it('checks the configured allowlist in production', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('GOOGLE_ALLOWED_USERS', 'allowed@example.com,another@example.com');

        await expect((await access('?email=allowed@example.com')).json()).resolves.toStrictEqual({ allowed: true });
        await expect((await access('?email=blocked@example.com')).json()).resolves.toStrictEqual({ allowed: false });
    });

    it('permits local development access without a configured allowlist', async () => {
        vi.stubEnv('NODE_ENV', 'test');
        vi.stubEnv('GOOGLE_ALLOWED_USERS', '');

        await expect((await access('?email=dev@example.com')).json()).resolves.toStrictEqual({ allowed: true });
    });
});
