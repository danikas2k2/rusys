/** @jest-environment node */
import { getGroupsFixture, getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleProducts } from '~/server/api/handleProducts';
import { getProductsWithGroups } from '~/server/api/response';
import type { ApiProductsWithYears } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/api/response');
jest.mock('~/server/data/products');

describe('handleProducts', () => {
    const request = mockRequest();
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const groups = getGroupsFixture();
    const variants = getVariantsFixture();
    const products = getProductsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(getProductsWithGroups).mockResolvedValueOnce({ years, groups, variants, products });

        await handleProducts(request, response);

        expect(getProductsWithGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, groups, variants, products });
    });

    it('returns empty response on failure', async () => {
        await handleProducts(request, response);

        expect(getProductsWithGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        jest.mocked(getProductsWithGroups).mockRejectedValueOnce('Failed to get products');

        await handleProducts(request, response);

        expect(getProductsWithGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get products' });
    });
});
