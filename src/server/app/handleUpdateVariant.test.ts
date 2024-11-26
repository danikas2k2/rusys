/** @jest-environment node */
import { type Variant } from '~/common/types';
import { handleUpdateVariant } from '~/server/app/handleUpdateVariant';
import { updateVariant } from '~/server/data/variants';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/variants');

describe('handleUpdateVariant', () => {
    const request = mockRequest<Variant>({ group: 'G', variant: 'd', order: 3 });
    const response = mockResponse();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (updateVariant as jest.Mock).mockResolvedValueOnce(true);

        await handleUpdateVariant(request, response);

        expect(updateVariant).toHaveBeenCalledWith('G', 'd', { order: 3 });
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns empty response on failure', async () => {
        (updateVariant as jest.Mock).mockResolvedValueOnce(false);

        await handleUpdateVariant(request, response);

        expect(updateVariant).toHaveBeenCalledWith('G', 'd', { order: 3 });
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        (updateVariant as jest.Mock).mockRejectedValueOnce('Failed to update variant');

        await handleUpdateVariant(request, response);

        expect(updateVariant).toHaveBeenCalledWith('G', 'd', { order: 3 });
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to update variant' });
    });
});
