import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import type { ApiProductsWithYears, ApiRequestProduct } from '~/common/api';
import { handleUndoProduct } from '~/server/api/handleUndoProduct';
import { getProductsWithYears } from '~/server/api/response';
import { undoProduct } from '~/server/data/products';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/products'));

describe('handleUndoProduct', () => {
    const request = mockRequest<ApiRequestProduct>({ group: 'Uogienės', name: 'Braškės', year: 21 });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(undoProduct).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleUndoProduct(request, response);

        expect(undoProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 21);
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(undoProduct).mockResolvedValueOnce(false);

        await handleUndoProduct(request, response);

        expect(undoProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 21);
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(undoProduct).mockRejectedValueOnce('Failed to undo');

        await handleUndoProduct(request, response);

        expect(undoProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 21);
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to undo' });
    });

    it('uses year=0 when year is not provided', async () => {
        const req = mockRequest<ApiRequestProduct>({ group: 'Uogienės', name: 'Braškės' });
        vi.mocked(undoProduct).mockResolvedValueOnce(false);

        await handleUndoProduct(req, response);

        expect(undoProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 0);
    });
});
