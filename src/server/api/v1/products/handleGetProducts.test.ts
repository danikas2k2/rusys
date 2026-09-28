// @vitest-environment node
import { handleGetProducts } from '~/server/api/v1/products/handleGetProducts';
import { getProductsWithYears } from '~/server/data/products';
import { mockResponse } from '~/server/data/tests/handleResponse';

vi.mock(import('~/server/data/products'));

describe('handleGetProducts', () => {
    it('handles its request', async () => {
        const response = mockResponse();
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ products: [], years: [] });

        await handleGetProducts({} as any, response as any);

        expect(response.json).toHaveBeenCalledWith({ products: [], years: [] });
    });
});
