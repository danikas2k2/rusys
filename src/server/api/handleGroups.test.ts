/** @jest-environment node */
import { getGroupsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleGroups } from '~/server/api/handleGroups';
import { getGroupsResponse } from '~/server/api/response';
import type { ApiGroups } from '~/types/api';

vi.mock('~/server/api/debug');
vi.mock('~/server/api/response');
vi.mock('~/server/data/products');
vi.mock('~/server/data/groups');

describe('handleGroups', () => {
    const request = mockRequest();
    const response = mockResponse<ApiGroups>();
    const groups = getGroupsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(getGroupsResponse).mockResolvedValueOnce({ groups });

        await handleGroups(request, response);

        expect(getGroupsResponse).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, groups });
    });

    it('returns empty response on failure', async () => {
        await handleGroups(request, response);

        expect(getGroupsResponse).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        vi.mocked(getGroupsResponse).mockRejectedValueOnce('Failed to get groups');

        await handleGroups(request, response);

        expect(getGroupsResponse).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get groups' });
    });
});
