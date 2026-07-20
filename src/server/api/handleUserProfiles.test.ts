/** @vitest-environment node */
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleUserProfiles } from '~/server/api/handleUserProfiles';
import { getUserProfiles } from '~/server/data/userProfiles';
import type { ApiGetUserProfiles, ApiUserProfiles } from '~/types/api';
import type { UserProfile } from '~/types/data';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/data/userProfiles'));

describe('handleUserProfiles', () => {
    const request = mockRequest<ApiGetUserProfiles>({ emails: ['user@example.com', 'other@example.com'] });
    const response = mockResponse<ApiUserProfiles>();

    const profiles: UserProfile[] = [
        { email: 'user@example.com', name: 'User', picture: 'https://example.com/pic.jpg' },
        { email: 'other@example.com' },
    ];

    afterEach(() => vi.clearAllMocks());

    it('returns profiles on success', async () => {
        vi.mocked(getUserProfiles).mockResolvedValueOnce(profiles);

        await handleUserProfiles(request, response);

        expect(getUserProfiles).toHaveBeenCalledWith(['user@example.com', 'other@example.com']);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, profiles });
    });

    it('returns error response on error', async () => {
        vi.mocked(getUserProfiles).mockRejectedValueOnce('Failed to get user profiles');

        await handleUserProfiles(request, response);

        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get user profiles' });
    });
});
