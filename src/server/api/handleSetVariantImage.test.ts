import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleSetVariantImage } from '~/server/api/handleSetVariantImage';
import { getProductsWithYears } from '~/server/api/response';
import { setVariantImage } from '~/server/data/products';
import type { ApiProductsWithYears, ApiSetVariantImage } from '~/types/api';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/products'));

describe('handleSetVariantImage', () => {
    const request = mockRequest<ApiSetVariantImage>({
        group: 'Uogienės',
        name: 'Braškės',
        variant: '0.5l',
        image: 'data:image/png;base64,AAA',
    });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(setVariantImage).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleSetVariantImage(request, response);

        expect(setVariantImage).toHaveBeenCalledWith('Uogienės', 'Braškės', '0.5l', 'data:image/png;base64,AAA');
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(setVariantImage).mockResolvedValueOnce(false);

        await handleSetVariantImage(request, response);

        expect(setVariantImage).toHaveBeenCalledWith('Uogienės', 'Braškės', '0.5l', 'data:image/png;base64,AAA');
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(setVariantImage).mockRejectedValueOnce('Failed to update variant image');

        await handleSetVariantImage(request, response);

        expect(setVariantImage).toHaveBeenCalledWith('Uogienės', 'Braškės', '0.5l', 'data:image/png;base64,AAA');
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to update variant image' });
    });
});
