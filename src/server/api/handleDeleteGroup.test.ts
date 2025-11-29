/** @jest-environment node */
import { getGroupsFixture, getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleDeleteGroup } from '~/server/api/handleDeleteGroup';
import { getProductsWithGroups } from '~/server/api/response';
import { deleteGroupOccurrences } from '~/server/data/common';
import type { ApiProductsWithYears, ApiRequestGroup } from '~/types/api';

vi.mock('~/server/api/debug');
vi.mock('~/server/api/response');
vi.mock('~/server/data/common');
vi.mock('~/server/data/products');
vi.mock('~/server/data/groups');

describe('handleDeleteGroup', () => {
    const request = mockRequest<ApiRequestGroup>({ group: 'Uogienės' });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();
    const variants = getVariantsFixture();
    const groups = getGroupsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(deleteGroupOccurrences).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithGroups).mockResolvedValueOnce({ years, products, variants, groups });

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('Uogienės');
        expect(getProductsWithGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products, variants, groups });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(deleteGroupOccurrences).mockResolvedValueOnce(false);

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('Uogienės');
        expect(getProductsWithGroups).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(deleteGroupOccurrences).mockRejectedValueOnce('Failed to delete group');

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('Uogienės');
        expect(getProductsWithGroups).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to delete group' });
    });
});
