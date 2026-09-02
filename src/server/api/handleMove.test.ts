/** @vitest-environment node */
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import type { ApiMoveProduct, ApiProductsWithYears } from '~/common/api';
import { handleMove } from '~/server/api/handleMove';
import { getProductsWithYears } from '~/server/api/response';
import { moveProductOccurrences } from '~/server/data/common';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/common'));
vi.mock(import('~/server/data/products'));

describe('handleMove', () => {
    const request = mockRequest<ApiMoveProduct>({ group: 'Uogienės', name: 'Braškės', newGroup: 'Daržovės' });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(moveProductOccurrences).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleMove(request, response);

        expect(moveProductOccurrences).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Daržovės', undefined);
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(moveProductOccurrences).mockResolvedValueOnce(false);

        await handleMove(request, response);

        expect(moveProductOccurrences).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Daržovės', undefined);
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(moveProductOccurrences).mockRejectedValueOnce('Failed to move');

        await handleMove(request, response);

        expect(moveProductOccurrences).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Daržovės', undefined);
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to move' });
    });
});
