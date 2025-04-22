/** @jest-environment node */
import { getGroupsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { type ApiGroups } from '~/common/api';
import { handleGroups } from '~/server/app/handleGroups';
import { getGroupsResponse } from '~/server/data/groups';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');
jest.mock('~/server/data/groups');

describe('handleGroups', () => {
    const request = mockRequest();
    const response = mockResponse<ApiGroups>();
    const groups = getGroupsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(getGroupsResponse).mockResolvedValueOnce({ groups });

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
        jest.mocked(getGroupsResponse).mockRejectedValueOnce('Failed to get groups');

        await handleGroups(request, response);

        expect(getGroupsResponse).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get groups' });
    });
});
