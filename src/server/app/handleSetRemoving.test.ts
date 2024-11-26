/** @jest-environment node */
import { type ApiSetRemoving } from '~/common/api';
import { handleSetRemoving } from '~/server/app/handleSetRemoving';
import { setRemoving } from '~/server/data/details';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');

describe('handleSetRemoving', () => {
    const request = mockRequest<ApiSetRemoving>({ group: 'G', name: 'A', year: 21, removing: true });
    const response = mockResponse();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (setRemoving as jest.Mock).mockResolvedValueOnce(true);

        await handleSetRemoving(request, response);

        expect(setRemoving).toHaveBeenCalledWith('G', 'A', 21, true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns empty response on failure', async () => {
        (setRemoving as jest.Mock).mockResolvedValueOnce(false);

        await handleSetRemoving(request, response);

        expect(setRemoving).toHaveBeenCalledWith('G', 'A', 21, true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        (setRemoving as jest.Mock).mockRejectedValueOnce('Failed to set removing');

        await handleSetRemoving(request, response);

        expect(setRemoving).toHaveBeenCalledWith('G', 'A', 21, true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to set removing' });
    });
});
