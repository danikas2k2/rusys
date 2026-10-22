import { OAuth2Client } from 'google-auth-library';
import { ClientSession } from 'mongodb';

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
        ['', 'id'],
        ['id-token', 'other'],
    ])('rejects malformed login arguments', async (token, kind) => {
        await expect(loginWithGoogle({ token: token as never, kind: kind as never })).rejects.toThrow('Invalid login');

        expect(createSession).not.toHaveBeenCalled();
        expect(getUserProfiles).not.toHaveBeenCalled();
        expect(upsertUserProfile).not.toHaveBeenCalled();
    });

    it('rejects untrusted profile fields instead of accepting a client identity', async () => {
        const verify = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken');

        await expect(
            loginWithGoogle({
                token: 'id-token',
                kind: 'id',
                email: 'attacker@example.com',
                allowed: true,
            } as never)
        ).rejects.toThrow('Invalid login');
        expect(verify).not.toHaveBeenCalled();
        expect(createSession).not.toHaveBeenCalled();
    });

    it('verifies a Google ID token before creating the session', async () => {
        vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
            getPayload: () => ({ sub: 'google-user', email: 'User@Example.com', email_verified: true }),
        } as any);

        await expect(loginWithGoogle({ token: 'id-token', kind: 'id' })).resolves.toMatchObject({
            sub: 'google-user',
            email: 'user@example.com',
            allowed: true,
        });
        expect(createSession).toHaveBeenCalledWith(expect.objectContaining({ sub: 'google-user' }));
        expect(upsertUserProfile).toHaveBeenCalledWith(
            { email: 'user@example.com', name: undefined, picture: undefined },
            expect.any(ClientSession)
        );
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

        await loginWithGoogle({ token: 'id-token', kind: 'id' });

        expect(upsertUserProfile).not.toHaveBeenCalled();
        expect(createSession).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ sub: 'google-user' }));
    });

    it('rejects an unverified email', async () => {
        vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
            getPayload: () => ({ sub: 'google-user', email: 'user@example.com', email_verified: false }),
        } as any);

        await expect(loginWithGoogle({ token: 'id-token', kind: 'id' })).rejects.toThrow('User is not allowed');
        expect(createSession).not.toHaveBeenCalled();
    });

    it('rejects an access token issued to another client', async () => {
        vi.spyOn(OAuth2Client.prototype, 'getTokenInfo').mockResolvedValue({
            aud: 'other-client',
            user_id: 'google-user',
        } as any);

        await expect(loginWithGoogle({ token: 'access-token', kind: 'access' })).rejects.toThrow(
            'Invalid token audience'
        );
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

        await expect(loginWithGoogle({ token: 'access-token', kind: 'access' })).rejects.toThrow(
            'Google identity mismatch'
        );
        expect(createSession).not.toHaveBeenCalled();
    });

    it('accepts an access token whose token info identifies the user with sub', async () => {
        vi.spyOn(OAuth2Client.prototype, 'getTokenInfo').mockResolvedValue({
            aud: 'client-id',
            sub: 'google-user',
        } as any);
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ sub: 'google-user', email: 'user@example.com', email_verified: true }),
            })
        );

        await expect(loginWithGoogle({ token: 'access-token', kind: 'access' })).resolves.toMatchObject({
            sub: 'google-user',
            email: 'user@example.com',
            allowed: true,
        });
        expect(createSession).toHaveBeenCalledWith(expect.objectContaining({ sub: 'google-user' }));
    });

    it('rejects a failed Google userinfo response', async () => {
        vi.spyOn(OAuth2Client.prototype, 'getTokenInfo').mockResolvedValue({
            aud: 'client-id',
            user_id: 'google-user',
        } as any);
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

        await expect(loginWithGoogle({ token: 'access-token', kind: 'access' })).rejects.toThrow(
            'Google userinfo failed'
        );
        expect(createSession).not.toHaveBeenCalled();
    });

    it('revokes the server session on logout', async () => {
        await logout();

        expect(deleteSession).toHaveBeenCalledWith();
    });
});

vi.mock(import('~/server/db'));
