/** @jest-environment node */
import { getGroupsFixture, getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleDeleteGroup } from '~/server/api/handleDeleteGroup';
import { getProductsWithGroups } from '~/server/api/response';
import { deleteGroupOccurrences } from '~/server/data/common';
import type { ApiGroups, ApiRequestGroup } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/api/response');
jest.mock('~/server/data/common');
jest.mock('~/server/data/products');
jest.mock('~/server/data/groups');

describe('handleDeleteGroup', () => {
    const request = mockRequest<ApiRequestGroup>({ group: 'Uogienės' });
    const response = mockResponse<ApiGroups>();
    const years = getYearsFixture();
    const products = getProductsFixture();
    const variants = getVariantsFixture();
    const groups = getGroupsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(deleteGroupOccurrences).mockResolvedValueOnce(true);
        jest.mocked(getProductsWithGroups).mockResolvedValueOnce({ years, products, variants, groups });

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('Uogienės');
        expect(getProductsWithGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products, variants, groups });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(deleteGroupOccurrences).mockResolvedValueOnce(false);

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('Uogienės');
        expect(getProductsWithGroups).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(deleteGroupOccurrences).mockRejectedValueOnce('Failed to delete group');

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('Uogienės');
        expect(getProductsWithGroups).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to delete group' });
    });
});
