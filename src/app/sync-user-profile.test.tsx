import { isDevMode } from '~/common/utils/dev';
import { syncUserProfile } from '~/server/actions/syncUserProfile';
import { getUserProfiles, upsertUserProfile } from '~/server/data/userProfiles';

vi.mock(import('~/common/utils/dev'), () => ({
    DEV_CLIENT_ID: 'dev-mode',
    isDevMode: vi.fn().mockReturnValue(true),
}));
vi.mock(import('~/server/data/userProfiles'));

describe('syncUserProfile', () => {
    beforeEach(() => {
        vi.mocked(isDevMode).mockReturnValue(true);
        vi.mocked(getUserProfiles).mockResolvedValue([]);
        vi.mocked(upsertUserProfile).mockResolvedValue(true);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.clearAllMocks();
    });

    it('creates a missing profile using one server-side lookup', async () => {
        await syncUserProfile({ email: ' User@Example.com ', name: 'Alice' });

        expect(getUserProfiles).toHaveBeenCalledWith(['user@example.com']);
        expect(upsertUserProfile).toHaveBeenCalledWith('user@example.com', 'Alice', undefined);
    });

    it('skips a fresh profile and updates changed details', async () => {
        vi.mocked(getUserProfiles).mockResolvedValue([
            { email: 'user@example.com', name: 'Alice', updatedAt: Date.now() },
        ]);

        await syncUserProfile({ email: 'user@example.com', name: 'Alice' });

        expect(upsertUserProfile).not.toHaveBeenCalled();

        await syncUserProfile({ email: 'user@example.com', name: 'Bob' });

        expect(upsertUserProfile).toHaveBeenCalledWith('user@example.com', 'Bob', undefined);
    });

    it('refreshes a stale profile', async () => {
        vi.mocked(getUserProfiles).mockResolvedValue([
            { email: 'user@example.com', name: 'Alice', updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000 },
        ]);

        await syncUserProfile({ email: 'user@example.com', name: 'Alice' });

        expect(upsertUserProfile).toHaveBeenCalledExactlyOnceWith('user@example.com', 'Alice', undefined);
    });

    it('does not write malformed or disallowed profiles', async () => {
        await syncUserProfile({ email: '   ' });
        vi.mocked(isDevMode).mockReturnValue(false);
        vi.stubEnv('GOOGLE_CLIENT_ID', 'production-google-id');
        vi.stubEnv('GOOGLE_ALLOWED_USERS', 'other@example.com');
        await syncUserProfile({ email: 'unknown@example.com' });

        expect(getUserProfiles).not.toHaveBeenCalled();
        expect(upsertUserProfile).not.toHaveBeenCalled();
    });
});
