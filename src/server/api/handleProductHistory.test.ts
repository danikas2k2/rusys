import { getGroupsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import type { ApiHistory, ApiRequestHistory } from '~/common/api';
import type { History } from '~/common/data';
import { handleProductHistory } from '~/server/api/handleProductHistory';
import { getGroups } from '~/server/data/groups';
import { getProductUndates, getProductUpdates } from '~/server/data/products';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/data/products'));
vi.mock(import('~/server/data/groups'));

describe('handleProductHistory', () => {
    const request = mockRequest<ApiRequestHistory>({ group: 'Uogienės', name: 'Braškės', year: 22 });
    const response = mockResponse<ApiHistory>();

    const updates: History[] = [{ group: 'Uogienės', name: 'Braškės', time: 1000, year: 22 }];
    const undates: History[] = [{ group: 'Uogienės', name: 'Braškės', time: 2000, year: 22 }];
    const groups = getGroupsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(getProductUpdates).mockResolvedValueOnce(updates);
        vi.mocked(getProductUndates).mockResolvedValueOnce(undates);
        vi.mocked(getGroups).mockResolvedValueOnce(groups);

        await handleProductHistory(request, response);

        expect(getProductUpdates).toHaveBeenCalledWith('Uogienės', 'Braškės', 22);
        expect(getProductUndates).toHaveBeenCalledWith('Uogienės', 'Braškės', 22);
        expect(getGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, updates, undates, groups });
    });

    it('returns error response on error', async () => {
        vi.mocked(getProductUpdates).mockRejectedValueOnce('Failed to get history');

        await handleProductHistory(request, response);

        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get history' });
    });
});
