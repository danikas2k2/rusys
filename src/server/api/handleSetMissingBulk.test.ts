import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleSetMissingBulk } from '~/server/api/handleSetMissingBulk';
import { getProductsWithYears } from '~/server/api/response';
import { setMissingBulk } from '~/server/data/products';
import type { ApiProductsWithYears, ApiSetMissingBulk } from '~/types/api';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/products'));

describe('handleSetMissingBulk', () => {
    const updates = [
        { group: 'Uogienės', name: 'Avietės', missing: true },
        { group: 'Uogienės', name: 'Braškės', missing: false },
    ];
    const request = mockRequest<ApiSetMissingBulk>({ updates });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(setMissingBulk).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleSetMissingBulk(request, response);

        expect(setMissingBulk).toHaveBeenCalledWith(updates);
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(setMissingBulk).mockResolvedValueOnce(false);

        await handleSetMissingBulk(request, response);

        expect(setMissingBulk).toHaveBeenCalledWith(updates);
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(setMissingBulk).mockRejectedValueOnce('Failed to set missing bulk');

        await handleSetMissingBulk(request, response);

        expect(setMissingBulk).toHaveBeenCalledWith(updates);
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to set missing bulk' });
    });
});
