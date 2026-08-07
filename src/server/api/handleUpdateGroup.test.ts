import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleUpdateGroup } from '~/server/api/handleUpdateGroup';
import { updateGroup } from '~/server/data/groups';
import type { ApiUpdateGroup } from '~/types/api';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/data/groups'));

describe('handleUpdateGroup', () => {
    const request = mockRequest<ApiUpdateGroup>({ group: 'Uogienės' });
    const response = mockResponse();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(updateGroup).mockResolvedValueOnce(true);

        await handleUpdateGroup(request, response);

        expect(updateGroup).toHaveBeenCalledWith('Uogienės', undefined, undefined, undefined);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(updateGroup).mockResolvedValueOnce(false);

        await handleUpdateGroup(request, response);

        expect(updateGroup).toHaveBeenCalledWith('Uogienės', undefined, undefined, undefined);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(updateGroup).mockRejectedValueOnce('Failed to update group');

        await handleUpdateGroup(request, response);

        expect(updateGroup).toHaveBeenCalledWith('Uogienės', undefined, undefined, undefined);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to update group' });
    });
});
