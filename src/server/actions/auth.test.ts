import { OAuth2Client } from 'google-auth-library';

import { loginWithGoogle, logout } from '~/server/actions/auth';
import { createSession, deleteSession, isAllowedEmail } from '~/server/auth/session';
import { getUserProfiles, upsertUserProfile } from '~/server/data/userProfiles';

vi.mock(import('~/server/auth/session'), () => ({
    createSession: vi.fn(),
    deleteSession: vi.fn(),
    isAllowedEmail: vi.fn(),
}));
vi.mock(import('~/server/data/userProfiles'));

describe('google server authentication', () => {
    beforeEach(() => {
        vi.stubEnv('GOOGLE_CLIENT_ID', 'client-id');
        vi.mocked(isAllowedEmail).mockReturnValue(true);
        vi.mocked(getUserProfiles).mockResolvedValue([]);
        vi.mocked(upsertUserProfile).mockResolvedValue(true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        vi.clearAllMocks();
    });

    it.each([
        [42, 'id'],
        ['id-token', 'other'],
    ])('rejects malformed login arguments', async (token, kind) => {
        await expect(loginWithGoogle(token as never, kind as never)).rejects.toThrow('Invalid login');

        expect(createSession).not.toHaveBeenCalled();
    });

    it('verifies a Google ID token before creating the session', async () => {
        vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
            getPayload: () => ({ sub: 'google-user', email: 'User@Example.com', email_verified: true }),
        } as any);

        await expect(loginWithGoogle('id-token', 'id')).resolves.toMatchObject({
            sub: 'google-user',
            email: 'user@example.com',
            allowed: true,
        });
        expect(createSession).toHaveBeenCalledWith(expect.objectContaining({ sub: 'google-user' }));
        expect(upsertUserProfile).toHaveBeenCalledWith('user@example.com', undefined, undefined);
    });

    it('keeps a recently synchronized profile without rewriting it', async () => {
        vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
            getPayload: () => ({
                sub: 'google-user',
                email: 'User@Example.com',
                email_verified: true,
                name: 'User',
                picture: 'portrait',
            }),
        } as any);
        vi.mocked(getUserProfiles).mockResolvedValueOnce([
            {
                email: 'user@example.com',
                name: 'User',
                picture: 'portrait',
                updatedAt: Date.now(),
            },
        ]);

        await loginWithGoogle('id-token', 'id');

        expect(upsertUserProfile).not.toHaveBeenCalled();
        expect(createSession).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ sub: 'google-user' }));
    });

    it('rejects an unverified email', async () => {
        vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
            getPayload: () => ({ sub: 'google-user', email: 'user@example.com', email_verified: false }),
        } as any);

        await expect(loginWithGoogle('id-token', 'id')).rejects.toThrow('User is not allowed');
        expect(createSession).not.toHaveBeenCalled();
    });

    it('rejects an access token issued to another client', async () => {
        vi.spyOn(OAuth2Client.prototype, 'getTokenInfo').mockResolvedValue({
            aud: 'other-client',
            user_id: 'google-user',
        } as any);

        await expect(loginWithGoogle('access-token', 'access')).rejects.toThrow('Invalid token audience');
        expect(createSession).not.toHaveBeenCalled();
    });

    it('checks the access token subject against Google userinfo', async () => {
        vi.spyOn(OAuth2Client.prototype, 'getTokenInfo').mockResolvedValue({
            aud: 'client-id',
            user_id: 'google-user',
        } as any);
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ sub: 'different-user', email: 'user@example.com', email_verified: true }),
            })
        );

        await expect(loginWithGoogle('access-token', 'access')).rejects.toThrow('Google identity mismatch');
        expect(createSession).not.toHaveBeenCalled();
    });

    it('rejects a failed Google userinfo response', async () => {
        vi.spyOn(OAuth2Client.prototype, 'getTokenInfo').mockResolvedValue({
            aud: 'client-id',
            user_id: 'google-user',
        } as any);
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

        await expect(loginWithGoogle('access-token', 'access')).rejects.toThrow('Google userinfo failed');
        expect(createSession).not.toHaveBeenCalled();
    });

    it('revokes the server session on logout', async () => {
        await logout();

        expect(deleteSession).toHaveBeenCalledWith();
    });
});
