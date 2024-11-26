/** @jest-environment node */
import { type ApiSetMissing } from '~/common/api';
import { handleSetMissing } from '~/server/app/handleSetMissing';
import { setMissing } from '~/server/data/details';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');

describe('handleSetMissing', () => {
    const request = mockRequest<ApiSetMissing>({ group: 'G', name: 'A', missing: true });
    const response = mockResponse();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (setMissing as jest.Mock).mockResolvedValueOnce(true);

        await handleSetMissing(request, response);

        expect(setMissing).toHaveBeenCalledWith('G', 'A', true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns empty response on failure', async () => {
        (setMissing as jest.Mock).mockResolvedValueOnce(false);

        await handleSetMissing(request, response);

        expect(setMissing).toHaveBeenCalledWith('G', 'A', true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        (setMissing as jest.Mock).mockRejectedValueOnce('Failed to set missing');

        await handleSetMissing(request, response);

        expect(setMissing).toHaveBeenCalledWith('G', 'A', true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to set missing' });
    });
});
