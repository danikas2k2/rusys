import { cookies } from 'next/headers';

import { isDevMode } from '~/common/utils/dev';
import { createSession, deleteSession, getSessionProfile, requireSession } from '~/server/auth/session';
import { db } from '~/server/db';

vi.mock(import('next/headers'), () => ({ cookies: vi.fn() }));
vi.mock(import('~/common/utils/dev'), () => ({ isDevMode: vi.fn() }));
vi.mock(import('~/server/db'), () => ({ db: vi.fn() }));

describe('server session', () => {
    const get = vi.fn();
    const set = vi.fn();
    const remove = vi.fn();
    const insertOne = vi.fn();
    const findOne = vi.fn();
    const deleteOne = vi.fn();

    beforeEach(() => {
        vi.mocked(isDevMode).mockReturnValue(false);
        vi.mocked(cookies).mockResolvedValue({ get, set, delete: remove } as any);
        vi.mocked(db).mockResolvedValue({ collection: () => ({ insertOne, findOne, deleteOne }) } as any);
        vi.stubEnv('GOOGLE_ALLOWED_USERS', 'user@example.com');
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllEnvs();
    });

    it('stores only a hash and sets an HttpOnly cookie', async () => {
        await createSession({ sub: 'google-user', email: 'user@example.com', allowed: true });

        const [cookieName, token, options] = set.mock.calls[0];

        expect(cookieName).toBe('rusys_session');
        expect(token).toMatch(/^[a-f0-9]{64}$/);
        expect(options).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' });
        expect(insertOne).toHaveBeenCalledWith(
            expect.objectContaining({
                tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
            })
        );
        expect(insertOne.mock.calls[0][0].tokenHash).not.toBe(token);
    });

    it('rejects requests without a session cookie', async () => {
        get.mockReturnValue(undefined);

        await expect(requireSession()).rejects.toThrow('Unauthorized');
        expect(findOne).not.toHaveBeenCalled();
    });

    it('checks the allowlist again for an existing session', async () => {
        get.mockReturnValue({ value: 'a'.repeat(64) });
        findOne.mockResolvedValue({ profile: { sub: 'google-user', email: 'removed@example.com' } });

        await expect(getSessionProfile()).resolves.toBeUndefined();
    });

    it('revokes a session by deleting its hash and cookie', async () => {
        get.mockReturnValue({ value: 'a'.repeat(64) });

        await deleteSession();

        expect(deleteOne).toHaveBeenCalledWith({ tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/) });
        expect(remove).toHaveBeenCalledWith('rusys_session');
    });
});
