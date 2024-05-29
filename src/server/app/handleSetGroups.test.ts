/** @jest-environment node */
import { type ApiGroups } from '~/common/api';
import { handleSetGroups } from '~/server/app/handleSetGroups';
import { getGroups, setGroups } from '~/server/data/groups';
import { getGroupsFixture } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/groups');

describe('handleSetGroups', () => {
    const groups = getGroupsFixture();
    const request = mockRequest<ApiGroups>({ groups });
    const response = mockResponse<ApiGroups>();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (setGroups as jest.Mock).mockResolvedValueOnce(true);
        (getGroups as jest.Mock).mockResolvedValueOnce(groups);

        await handleSetGroups(request, response);

        expect(setGroups).toHaveBeenCalledWith(groups);
        expect(getGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, groups });
    });

    it('returns empty response on failure', async () => {
        (setGroups as jest.Mock).mockResolvedValueOnce(false);

        await handleSetGroups(request, response);

        expect(setGroups).toHaveBeenCalledWith(groups);
        expect(getGroups).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (setGroups as jest.Mock).mockRejectedValueOnce('Failed to set groups');

        await handleSetGroups(request, response);

        expect(setGroups).toHaveBeenCalledWith(groups);
        expect(getGroups).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to set groups' });
    });
});
