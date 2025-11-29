/** @jest-environment node */
import { getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleDeleteVariant } from '~/server/api/handleDeleteVariant';
import { getProductsWithVariants } from '~/server/api/response';
import { deleteVariantOccurrences } from '~/server/data/common';
import type { ApiProductsWithYears, ApiRequestVariant } from '~/types/api';

vi.mock('~/server/api/debug');
vi.mock('~/server/api/response');
vi.mock('~/server/data/common');
vi.mock('~/server/data/variants');

describe('handleDeleteVariant', () => {
    const request = mockRequest<ApiRequestVariant>({ group: 'Uogienės', variant: 'd' });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();
    const variants = getVariantsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(deleteVariantOccurrences).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithVariants).mockResolvedValueOnce({ years, products, variants });

        await handleDeleteVariant(request, response);

        expect(deleteVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'd');
        expect(getProductsWithVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products, variants });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(deleteVariantOccurrences).mockResolvedValueOnce(false);

        await handleDeleteVariant(request, response);

        expect(deleteVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'd');
        expect(getProductsWithVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(deleteVariantOccurrences).mockRejectedValueOnce('Failed to delete variant');

        await handleDeleteVariant(request, response);

        expect(deleteVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'd');
        expect(getProductsWithVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to delete variant' });
    });
});
