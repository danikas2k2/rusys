import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import type { ApiProductsWithYears, ApiSetImage } from '@rusys/common/api';

import { handleSetImage } from '~/server/api/handleSetImage';
import { getProductsWithYears } from '~/server/api/response';
import { setImage } from '~/server/data/products';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/products'));

describe('handleSetImage', () => {
    const request = mockRequest<ApiSetImage>({
        group: 'Uogienės',
        name: 'Braškės',
        image: 'data:image/png;base64,AAA',
    });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(setImage).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleSetImage(request, response);

        expect(setImage).toHaveBeenCalledWith('Uogienės', 'Braškės', 'data:image/png;base64,AAA');
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(setImage).mockResolvedValueOnce(false);

        await handleSetImage(request, response);

        expect(setImage).toHaveBeenCalledWith('Uogienės', 'Braškės', 'data:image/png;base64,AAA');
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(setImage).mockRejectedValueOnce('Failed to update product image');

        await handleSetImage(request, response);

        expect(setImage).toHaveBeenCalledWith('Uogienės', 'Braškės', 'data:image/png;base64,AAA');
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to update product image' });
    });
});
