/** @jest-environment node */
import { type ApiGroups } from '~/common/api';
import { handleGroups } from '~/server/app/handleGroups';
import { getGroups } from '~/server/data/groups';
import { getTestGroups } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');
jest.mock('~/server/data/groups');

describe('handleGroups', () => {
    const request = mockRequest();
    const response = mockResponse<ApiGroups>();
    const groups = getTestGroups();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (getGroups as jest.Mock).mockResolvedValueOnce(groups);

        await handleGroups(request, response);

        expect(getGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, groups });
    });

    it('returns empty response on failure', async () => {
        await handleGroups(request, response);

        expect(getGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (getGroups as jest.Mock).mockRejectedValueOnce('Failed to get groups');

        await handleGroups(request, response);

        expect(getGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get groups' });
    });
});
