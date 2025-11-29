/** @jest-environment node */
import { getGroupsFixture, getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleRenameGroup } from '~/server/api/handleRenameGroup';
import { getProductsWithGroups } from '~/server/api/response';
import { renameGroupOccurrences } from '~/server/data/common';
import type { ApiProductsWithYears, ApiRenameGroup } from '~/types/api';

vi.mock('~/server/api/debug');
vi.mock('~/server/api/response');
vi.mock('~/server/data/common');
vi.mock('~/server/data/products');
vi.mock('~/server/data/groups');

describe('handleRenameGroup', () => {
    const request = mockRequest<ApiRenameGroup>({ group: 'Uogienės', newGroup: 'Daržovės' });
    const response = mockResponse<ApiProductsWithYears>();
    const years = getYearsFixture();
    const products = getProductsFixture();
    const variants = getVariantsFixture();
    const groups = getGroupsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(renameGroupOccurrences).mockResolvedValueOnce(true);
        vi.mocked(getProductsWithGroups).mockResolvedValueOnce({ years, products, variants, groups });

        await handleRenameGroup(request, response);

        expect(renameGroupOccurrences).toHaveBeenCalledWith('Uogienės', 'Daržovės', undefined);
        expect(getProductsWithGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products, variants, groups });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(renameGroupOccurrences).mockResolvedValueOnce(false);

        await handleRenameGroup(request, response);

        expect(renameGroupOccurrences).toHaveBeenCalledWith('Uogienės', 'Daržovės', undefined);
        expect(getProductsWithGroups).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(renameGroupOccurrences).mockRejectedValueOnce('Failed to rename group');

        await handleRenameGroup(request, response);

        expect(renameGroupOccurrences).toHaveBeenCalledWith('Uogienės', 'Daržovės', undefined);
        expect(getProductsWithGroups).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to rename group' });
    });
});
