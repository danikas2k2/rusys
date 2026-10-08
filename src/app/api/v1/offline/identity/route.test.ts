import { getSessionProfile } from '~/server/auth/session';
import { GET } from './route';

vi.mock(import('~/server/auth/session'), () => ({ getSessionProfile: vi.fn() }));

describe('offline identity route', () => {
    it('returns the signed-in user without HTTP caching', async () => {
        vi.mocked(getSessionProfile).mockResolvedValueOnce({ sub: 'alice', allowed: true });

        const response = await GET();

        expect(response.status).toBe(200);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        await expect(response.json()).resolves.toStrictEqual({ sub: 'alice' });
    });

    it('rejects a guest', async () => {
        vi.mocked(getSessionProfile).mockResolvedValueOnce(undefined);

        const response = await GET();

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toStrictEqual({});
    });
});
