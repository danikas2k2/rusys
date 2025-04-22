/** @jest-environment node */
import { getGroupsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { type ApiGroups } from '~/common/api';
import { handleSetGroups } from '~/server/app/handleSetGroups';
import { getGroupsResponse, setGroups } from '~/server/data/groups';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/groups');

describe('handleSetGroups', () => {
    const groups = getGroupsFixture();
    const request = mockRequest<ApiGroups>({ groups });
    const response = mockResponse<ApiGroups>();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(setGroups).mockResolvedValueOnce(true);
        jest.mocked(getGroupsResponse).mockResolvedValueOnce({ groups });

        await handleSetGroups(request, response);

        expect(setGroups).toHaveBeenCalledWith(groups);
        expect(getGroupsResponse).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, groups });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(setGroups).mockResolvedValueOnce(false);

        await handleSetGroups(request, response);

        expect(setGroups).toHaveBeenCalledWith(groups);
        expect(getGroupsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(setGroups).mockRejectedValueOnce('Failed to set groups');

        await handleSetGroups(request, response);

        expect(setGroups).toHaveBeenCalledWith(groups);
        expect(getGroupsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to set groups' });
    });
});
