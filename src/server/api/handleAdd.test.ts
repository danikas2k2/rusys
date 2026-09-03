import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import type { ApiAddProduct, ApiProductsWithYears } from '@rusys/common/api';

import { handleAdd } from '~/server/api/handleAdd';
import { getProductsWithYears } from '~/server/api/response';
import { addProduct } from '~/server/data/products';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/products'));

describe('handleAdd', () => {
    const request = mockRequest<ApiAddProduct>({ group: 'Uogienės', name: 'Braškės' });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => vi.clearAllMocks());

    it('adds product and returns updated products with years', async () => {
        vi.mocked(addProduct).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleAdd(request, response);

        expect(addProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', undefined);
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('passes parent through to addProduct when given', async () => {
        vi.mocked(addProduct).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleAdd(
            mockRequest<ApiAddProduct>({ group: 'Uogienės', name: 'Braškės', parent: 'Avietės' }),
            response
        );

        expect(addProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Avietės');
    });

    it('returns empty response on failure', async () => {
        vi.mocked(addProduct).mockResolvedValueOnce(false);

        await handleAdd(request, response);

        expect(addProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', undefined);
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(addProduct).mockRejectedValueOnce('Failed to add');

        await handleAdd(request, response);

        expect(addProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', undefined);
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to add' });
    });
});
