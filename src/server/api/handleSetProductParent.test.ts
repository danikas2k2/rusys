import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import type { ApiProductsWithYears, ApiSetParent } from '@rusys/common/api';

import { handleSetProductParent } from '~/server/api/handleSetProductParent';
import { getProductsWithYears } from '~/server/api/response';
import { setProductParent } from '~/server/data/products';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/products'));

describe('handleSetProductParent', () => {
    const request = mockRequest<ApiSetParent>({ group: 'Daržovės', name: 'Agurkai (Zewa)', parent: 'Agurkai' });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => vi.clearAllMocks());

    it('sets the parent and returns updated products with years', async () => {
        vi.mocked(setProductParent).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleSetProductParent(request, response);

        expect(setProductParent).toHaveBeenCalledWith('Daržovės', 'Agurkai (Zewa)', 'Agurkai');
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('returns ok response with no extra data on failure', async () => {
        vi.mocked(setProductParent).mockResolvedValueOnce(false);

        await handleSetProductParent(request, response);

        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(setProductParent).mockRejectedValueOnce('Failed to set parent');

        await handleSetProductParent(request, response);

        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to set parent' });
    });
});
