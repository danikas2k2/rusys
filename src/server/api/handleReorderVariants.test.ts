/** @jest-environment node */
import { getVariantsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleReorderVariants } from '~/server/api/handleReorderVariants';
import { getVariantsResponse } from '~/server/api/response';
import { reorderVariants } from '~/server/data/variants';
import type { ApiReorderVariants, ApiVariants } from '~/types/api';

vi.mock('~/server/api/debug');
vi.mock('~/server/api/response');
vi.mock('~/server/data/variants');

describe('handleReorderVariants', () => {
    const variants = getVariantsFixture();
    const reorder = { p: 0, d: 1 };
    const request = mockRequest<ApiReorderVariants>({ group: 'Uogienės', variants: reorder });
    const response = mockResponse<ApiVariants>();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(reorderVariants).mockResolvedValueOnce(true);
        vi.mocked(getVariantsResponse).mockResolvedValueOnce({ variants });

        await handleReorderVariants(request, response);

        expect(reorderVariants).toHaveBeenCalledWith('Uogienės', reorder);
        expect(getVariantsResponse).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, variants });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(reorderVariants).mockResolvedValueOnce(false);

        await handleReorderVariants(request, response);

        expect(reorderVariants).toHaveBeenCalledWith('Uogienės', reorder);
        expect(getVariantsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(reorderVariants).mockRejectedValueOnce('Failed to reorder variants');

        await handleReorderVariants(request, response);

        expect(reorderVariants).toHaveBeenCalledWith('Uogienės', reorder);
        expect(getVariantsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to reorder variants' });
    });
});
