/** @jest-environment node */
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleRename } from '~/server/api/handleRename';
import { getProductsWithYears } from '~/server/api/response';
import { renameProduct } from '~/server/data/products';
import type { ApiProductsWithYears, ApiRenameProduct } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/api/response');
jest.mock('~/server/data/products');

describe('handleRename', () => {
    const request = mockRequest<ApiRenameProduct>({ group: 'Uogienės', name: 'Braškės', newName: 'Braškienė' });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(renameProduct).mockResolvedValueOnce(true);
        jest.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleRename(request, response);

        expect(renameProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Braškienė');
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(renameProduct).mockResolvedValueOnce(false);

        await handleRename(request, response);

        expect(renameProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Braškienė');
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(renameProduct).mockRejectedValueOnce('Failed to rename product');

        await handleRename(request, response);

        expect(renameProduct).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Braškienė');
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to rename product' });
    });
});
