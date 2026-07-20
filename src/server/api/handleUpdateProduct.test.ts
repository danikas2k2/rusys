/** @vitest-environment node */
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { DEV_MODE_EMAIL } from '~/client/state/profile/dev';
import { handleUpdateProduct } from '~/server/api/handleUpdateProduct';
import { getProductsWithYears } from '~/server/api/response';
import { updateProduct } from '~/server/data/products';
import type { ApiProductsWithYears, ApiUpdateProduct } from '~/types/api';
import type { VariantAmount } from '~/types/data';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/products'));
vi.mock(import('~/server/data/years'));

describe('handleUpdateProduct', () => {
    const user = DEV_MODE_EMAIL;
    const amounts: VariantAmount[] = [
        { variant: 'd', amount: 2 },
        { variant: 'p', amount: -1, recycled: true },
    ];
    const request = mockRequest<ApiUpdateProduct>({
        group: 'Uogienės',
        name: 'Braškės',
        year: 21,
        amounts,
        user,
    });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(updateProduct).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleUpdateProduct(request, response);

        expect(updateProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 21, amounts, user, undefined);
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(updateProduct).mockResolvedValueOnce(false);

        await handleUpdateProduct(request, response);

        expect(updateProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 21, amounts, user, undefined);
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(updateProduct).mockRejectedValueOnce('Failed to update product');

        await handleUpdateProduct(request, response);

        expect(updateProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 21, amounts, user, undefined);
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to update product' });
    });
});
