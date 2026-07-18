/** @jest-environment node */
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleUpsertUserProfile } from '~/server/api/handleUpsertUserProfile';
import { upsertUserProfile } from '~/server/data/userProfiles';
import type { ApiUpsertUserProfile } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/data/userProfiles');

describe('handleUpsertUserProfile', () => {
    const request = mockRequest<ApiUpsertUserProfile>({ email: 'user@example.com', name: 'User', picture: 'https://example.com/pic.jpg' });
    const response = mockResponse();

    afterEach(() => jest.clearAllMocks());

    it('returns ok response on success', async () => {
        jest.mocked(upsertUserProfile).mockResolvedValueOnce(true);

        await handleUpsertUserProfile(request, response);

        expect(upsertUserProfile).toHaveBeenCalledWith('user@example.com', 'User', 'https://example.com/pic.jpg');
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(upsertUserProfile).mockRejectedValueOnce('Failed to upsert user profile');

        await handleUpsertUserProfile(request, response);

        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to upsert user profile' });
    });
});
