/** @jest-environment node */
import { type ApiVariants } from '~/common/api';
import { handleVariants } from '~/server/app/handleVariants';
import { getTestVariants } from '~/tests/fixtures';
import { getVariants } from '~/server/data/variants';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');
jest.mock('~/server/data/variants');

describe('handleVariants', () => {
    const request = mockRequest();
    const response = mockResponse<ApiVariants>();
    const variants = getTestVariants();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (getVariants as jest.Mock).mockResolvedValueOnce(variants);

        await handleVariants(request, response);

        expect(getVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, variants });
    });

    it('returns empty response on failure', async () => {
        await handleVariants(request, response);

        expect(getVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (getVariants as jest.Mock).mockRejectedValueOnce('Failed to get variants');

        await handleVariants(request, response);

        expect(getVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get variants' });
    });
});
