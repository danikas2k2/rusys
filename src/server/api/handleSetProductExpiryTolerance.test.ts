import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleSetProductExpiryTolerance } from '~/server/api/handleSetProductExpiryTolerance';
import { getProductsWithYears } from '~/server/api/response';
import { setProductExpiryTolerance } from '~/server/data/products';
import type { ApiProductsWithYears, ApiSetExpiryTolerance } from '~/types/api';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/products'));

describe('handleSetProductExpiryTolerance', () => {
    it('updates the tolerance and returns products', async () => {
        const request = mockRequest<ApiSetExpiryTolerance>({
            group: 'Daržovės',
            name: 'Agurkai',
            expiryToleranceDays: 365,
        });
        const response = mockResponse<ApiProductsWithYears>();
        const years = getYearsFixture();
        const products = getProductsFixture();
        vi.mocked(setProductExpiryTolerance).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleSetProductExpiryTolerance(request, response);

        expect(setProductExpiryTolerance).toHaveBeenCalledWith('Daržovės', 'Agurkai', 365);
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });
});
