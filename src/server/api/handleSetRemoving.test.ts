/** @jest-environment node */
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleSetRemoving } from '~/server/api/handleSetRemoving';
import { setRemoving } from '~/server/data/details';
import type { ApiSetRemoving } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/data/details');

describe('handleSetRemoving', () => {
    const request = mockRequest<ApiSetRemoving>({ group: 'Uogienės', name: 'Braškės', year: 21, removing: true });
    const response = mockResponse();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(setRemoving).mockResolvedValueOnce(true);

        await handleSetRemoving(request, response);

        expect(setRemoving).toHaveBeenCalledWith('Uogienės', 'Braškės', 21, true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(setRemoving).mockResolvedValueOnce(false);

        await handleSetRemoving(request, response);

        expect(setRemoving).toHaveBeenCalledWith('Uogienės', 'Braškės', 21, true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(setRemoving).mockRejectedValueOnce('Failed to set removing');

        await handleSetRemoving(request, response);

        expect(setRemoving).toHaveBeenCalledWith('Uogienės', 'Braškės', 21, true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to set removing' });
    });
});
