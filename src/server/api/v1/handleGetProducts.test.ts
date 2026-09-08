// @vitest-environment node
import { getProductsWithYears } from '~/server/api/response';

vi.mock(import('~/server/api/response'));

import { handleGetProducts } from '~/server/api/v1/handleGetProducts';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleGetProducts', () => {
    it('handles its request', async () => {
        const response = mockResponse();
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ products: [], years: [] });

        await handleGetProducts({} as any, response as any);

        expect(response.json).toHaveBeenCalledWith({ products: [], years: [] });
    });
});
