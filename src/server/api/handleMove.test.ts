/** @jest-environment node */
import { getProductsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleMove } from '~/server/api/handleMove';
import { getProductsWithYears } from '~/server/api/response';
import { moveProductOccurrences } from '~/server/data/common';
import type { ApiMoveProduct, ApiProductsWithYears } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/api/response');
jest.mock('~/server/data/common');
jest.mock('~/server/data/products');

describe('handleMove', () => {
    const request = mockRequest<ApiMoveProduct>({ group: 'Uogienės', name: 'Braškės', newGroup: 'Daržovės' });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(moveProductOccurrences).mockResolvedValueOnce(true);
        jest.mocked(getProductsWithYears).mockResolvedValueOnce({ years, products });

        await handleMove(request, response);

        expect(moveProductOccurrences).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Daržovės', undefined);
        expect(getProductsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(moveProductOccurrences).mockResolvedValueOnce(false);

        await handleMove(request, response);

        expect(moveProductOccurrences).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Daržovės', undefined);
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(moveProductOccurrences).mockRejectedValueOnce('Failed to move');

        await handleMove(request, response);

        expect(moveProductOccurrences).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Daržovės', undefined);
        expect(getProductsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to move' });
    });
});
