/** @jest-environment node */
import { type ApiGroups, type ApiReorderGroups } from '~/common/api';
import { handleReorderGroups } from '~/server/app/handleReorderGroups';
import { getGroups, reorderGroups } from '~/server/data/groups';
import { getGroupsFixture } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/groups');

describe('handleReorderGroups', () => {
    const groups = getGroupsFixture();
    const reorder = { G: 0, H: 1 };
    const request = mockRequest<ApiReorderGroups>({ groups: reorder });
    const response = mockResponse<ApiGroups>();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (reorderGroups as jest.Mock).mockResolvedValueOnce(true);
        (getGroups as jest.Mock).mockResolvedValueOnce(groups);

        await handleReorderGroups(request, response);

        expect(reorderGroups).toHaveBeenCalledWith(reorder);
        expect(getGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, groups });
    });

    it('returns empty response on failure', async () => {
        (reorderGroups as jest.Mock).mockResolvedValueOnce(false);

        await handleReorderGroups(request, response);

        expect(reorderGroups).toHaveBeenCalledWith(reorder);
        expect(getGroups).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (reorderGroups as jest.Mock).mockRejectedValueOnce('Failed to reorder groups');

        await handleReorderGroups(request, response);

        expect(reorderGroups).toHaveBeenCalledWith(reorder);
        expect(getGroups).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to reorder groups' });
    });
});
