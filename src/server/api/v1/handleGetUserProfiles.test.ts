// @vitest-environment node
import { getUserProfiles } from '~/server/data/userProfiles';

vi.mock(import('~/server/data/userProfiles'));

import { handleGetUserProfiles } from '~/server/api/v1/handleGetUserProfiles';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleGetUserProfiles', () => {
    it('handles its request', async () => {
        const response = mockResponse();
        vi.mocked(getUserProfiles).mockResolvedValueOnce([]);

        await handleGetUserProfiles({ query: {} } as any, response as any);

        expect(response.json).toHaveBeenCalledWith({ profiles: [] });
    });
});
