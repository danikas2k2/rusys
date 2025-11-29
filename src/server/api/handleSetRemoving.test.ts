/** @jest-environment node */
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleSetRemoving } from '~/server/api/handleSetRemoving';
import { setRemoving } from '~/server/data/products';
import type { ApiSetRemoving } from '~/types/api';

vi.mock('~/server/api/debug');
vi.mock('~/server/data/products');

describe('handleSetRemoving', () => {
    const request = mockRequest<ApiSetRemoving>({ group: 'Uogienės', name: 'Braškės', year: 21, removing: true });
    const response = mockResponse();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(setRemoving).mockResolvedValueOnce(true);

        await handleSetRemoving(request, response);

        expect(setRemoving).toHaveBeenCalledWith('Uogienės', 'Braškės', 21, true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(setRemoving).mockResolvedValueOnce(false);

        await handleSetRemoving(request, response);

        expect(setRemoving).toHaveBeenCalledWith('Uogienės', 'Braškės', 21, true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(setRemoving).mockRejectedValueOnce('Failed to set removing');

        await handleSetRemoving(request, response);

        expect(setRemoving).toHaveBeenCalledWith('Uogienės', 'Braškės', 21, true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to set removing' });
    });
});
