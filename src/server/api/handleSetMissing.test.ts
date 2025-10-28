/** @jest-environment node */
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleSetMissing } from '~/server/api/handleSetMissing';
import { setMissing } from '~/server/data/details';
import type { ApiSetMissing } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/data/details');

describe('handleSetMissing', () => {
    const request = mockRequest<ApiSetMissing>({ group: 'Uogienės', name: 'Braškės', missing: true });
    const response = mockResponse();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(setMissing).mockResolvedValueOnce(true);

        await handleSetMissing(request, response);

        expect(setMissing).toHaveBeenCalledWith('Uogienės', 'Braškės', true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(setMissing).mockResolvedValueOnce(false);

        await handleSetMissing(request, response);

        expect(setMissing).toHaveBeenCalledWith('Uogienės', 'Braškės', true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(setMissing).mockRejectedValueOnce('Failed to set missing');

        await handleSetMissing(request, response);

        expect(setMissing).toHaveBeenCalledWith('Uogienės', 'Braškės', true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to set missing' });
    });
});
