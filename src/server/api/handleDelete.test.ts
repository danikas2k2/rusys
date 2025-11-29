/** @jest-environment node */
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleDelete } from '~/server/api/handleDelete';
import { getProductsWithYears } from '~/server/api/response';
import { deleteProduct } from '~/server/data/products';
import type { ApiProductsWithYears, ApiRequestProduct } from '~/types/api';

vi.mock('~/server/api/debug');
vi.mock('~/server/api/response');
vi.mock('~/server/data/products');

describe('handleDelete', () => {
    const request = mockRequest<ApiRequestProduct>({ group: 'Uogienės', name: 'Braškės' });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => vi.clearAllMocks());

    it('removes product and returns updated products with years', async () => {
        vi.mocked(deleteProduct).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleDelete(request, response);

        expect(deleteProduct).toHaveBeenCalledWith('Uogienės', 'Braškės');
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(deleteProduct).mockResolvedValueOnce(false);

        await handleDelete(request, response);

        expect(deleteProduct).toHaveBeenCalledWith('Uogienės', 'Braškės');
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(deleteProduct).mockRejectedValueOnce('Failed to delete');

        await handleDelete(request, response);

        expect(deleteProduct).toHaveBeenCalledWith('Uogienės', 'Braškės');
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to delete' });
    });
});
