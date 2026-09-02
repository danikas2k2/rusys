/** @vitest-environment node */
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import type { ApiProductsWithYears, ApiRequestProduct } from '~/common/api';
import { handleRedoProduct } from '~/server/api/handleRedoProduct';
import { getProductsWithYears } from '~/server/api/response';
import { redoProduct } from '~/server/data/products';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/products'));

describe('handleRedoProduct', () => {
    const request = mockRequest<ApiRequestProduct>({ group: 'Uogienės', name: 'Braškės', year: 21 });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(redoProduct).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleRedoProduct(request, response);

        expect(redoProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 21);
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(redoProduct).mockResolvedValueOnce(false);

        await handleRedoProduct(request, response);

        expect(redoProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 21);
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(redoProduct).mockRejectedValueOnce('Failed to redo');

        await handleRedoProduct(request, response);

        expect(redoProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 21);
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to redo' });
    });

    it('uses year=0 when year is not provided', async () => {
        const req = mockRequest<ApiRequestProduct>({ group: 'Uogienės', name: 'Braškės' });
        vi.mocked(redoProduct).mockResolvedValueOnce(false);

        await handleRedoProduct(req, response);

        expect(redoProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 0);
    });
});
