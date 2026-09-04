import { getGroupsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import type { ApiGroups, ApiReorderGroups } from '@rusys/common/api';

import { handleReorderGroups } from '~/server/api/handleReorderGroups';
import { getGroupsResponse } from '~/server/api/response';
import { reorderGroups } from '~/server/data/groups';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/groups'));

describe('handleReorderGroups', () => {
    const groups = getGroupsFixture();
    const reorder = { G: 0, H: 1 };
    const request = mockRequest<ApiReorderGroups>({ groups: reorder });
    const response = mockResponse<ApiGroups>();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(reorderGroups).mockResolvedValueOnce(true);
        vi.mocked(getGroupsResponse).mockResolvedValueOnce({ groups });

        await handleReorderGroups(request, response);

        expect(reorderGroups).toHaveBeenCalledWith(reorder);
        expect(getGroupsResponse).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, groups });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(reorderGroups).mockResolvedValueOnce(false);

        await handleReorderGroups(request, response);

        expect(reorderGroups).toHaveBeenCalledWith(reorder);
        expect(getGroupsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(reorderGroups).mockRejectedValueOnce('Failed to reorder groups');

        await handleReorderGroups(request, response);

        expect(reorderGroups).toHaveBeenCalledWith(reorder);
        expect(getGroupsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to reorder groups' });
    });
});
