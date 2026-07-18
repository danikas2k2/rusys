/** @jest-environment node */
import { getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleRenameVariant } from '~/server/api/handleRenameVariant';
import { getProductsWithVariants } from '~/server/api/response';
import { renameVariantOccurrences } from '~/server/data/common';
import type { ApiRenameVariant, ApiVariants } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/api/response');
jest.mock('~/server/data/common');
jest.mock('~/server/data/variants');

describe('handleRenameVariant', () => {
    const request = mockRequest<ApiRenameVariant>({
        group: 'Uogienės',
        variant: 'd',
        newVariant: '3/4',
        order: 7,
        suffix: 'Suffix',
    });
    const response = mockResponse<ApiVariants>();
    const years = getYearsFixture();
    const products = getProductsFixture();
    const variants = getVariantsFixture();

    afterEach(() => jest.clearAllMocks());

    const update = {
        order: 7,
        suffix: 'Suffix',
    };

    it('returns filled response on success', async () => {
        jest.mocked(renameVariantOccurrences).mockResolvedValueOnce(true);
        jest.mocked(getProductsWithVariants).mockResolvedValueOnce({ years, products, variants });

        await handleRenameVariant(request, response);

        expect(renameVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'd', '3/4', update);
        expect(getProductsWithVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products, variants });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(renameVariantOccurrences).mockResolvedValueOnce(false);

        await handleRenameVariant(request, response);

        expect(renameVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'd', '3/4', update);
        expect(getProductsWithVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(renameVariantOccurrences).mockRejectedValueOnce('Failed to rename variant');

        await handleRenameVariant(request, response);

        expect(renameVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'd', '3/4', update);
        expect(getProductsWithVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to rename variant' });
    });
});
