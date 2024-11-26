/** @jest-environment node */
import { type ApiVariants, type ApiReorderVariants } from '~/common/api';
import { handleReorderVariants } from '~/server/app/handleReorderVariants';
import { getVariantsResponse, reorderVariants } from '~/server/data/variants';
import { getVariantsFixture } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/variants');

describe('handleReorderVariants', () => {
    const variants = getVariantsFixture();
    const reorder = { p: 0, d: 1 };
    const request = mockRequest<ApiReorderVariants>({ group: 'G', variants: reorder });
    const response = mockResponse<ApiVariants>();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (reorderVariants as jest.Mock).mockResolvedValueOnce(true);
        (getVariantsResponse as jest.Mock).mockResolvedValueOnce({ variants });

        await handleReorderVariants(request, response);

        expect(reorderVariants).toHaveBeenCalledWith('G', reorder);
        expect(getVariantsResponse).toHaveBeenCalledWith(true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, variants });
    });

    it('returns empty response on failure', async () => {
        (reorderVariants as jest.Mock).mockResolvedValueOnce(false);

        await handleReorderVariants(request, response);

        expect(reorderVariants).toHaveBeenCalledWith('G', reorder);
        expect(getVariantsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        (reorderVariants as jest.Mock).mockRejectedValueOnce('Failed to reorder variants');

        await handleReorderVariants(request, response);

        expect(reorderVariants).toHaveBeenCalledWith('G', reorder);
        expect(getVariantsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to reorder variants' });
    });
});
