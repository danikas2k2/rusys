import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import type { ApiProductsWithYears, ApiRenameProduct } from '@rusys/common/api';

import { handleRename } from '~/server/api/handleRename';
import { getProductsWithYears } from '~/server/api/response';
import { renameProduct } from '~/server/data/products';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/products'));

describe('handleRename', () => {
    const request = mockRequest<ApiRenameProduct>({ group: 'Uogienės', name: 'Braškės', newName: 'Braškienė' });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(renameProduct).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleRename(request, response);

        expect(renameProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Braškienė');
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(renameProduct).mockResolvedValueOnce(false);

        await handleRename(request, response);

        expect(renameProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Braškienė');
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(renameProduct).mockRejectedValueOnce('Failed to rename product');

        await handleRename(request, response);

        expect(renameProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Braškienė');
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to rename product' });
    });
});
