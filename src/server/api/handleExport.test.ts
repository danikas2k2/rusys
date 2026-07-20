// @vitest-environment node
import { getGroupsFixture, getProductsFixture, getVariantsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleExport } from '~/server/api/handleExport';
import { exportEverything } from '~/server/data/common';
import type { ApiExport } from '~/types/api';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/data/common'));

describe('handleExport', () => {
    const request = mockRequest();
    const response = mockResponse<ApiExport>();
    const products = getProductsFixture();
    const variants = getVariantsFixture();
    const groups = getGroupsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(exportEverything).mockResolvedValueOnce({ products, variants, groups });

        await handleExport(request, response);

        expect(exportEverything).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, products, variants, groups });
    });

    it('returns error response on error', async () => {
        vi.mocked(exportEverything).mockRejectedValueOnce('Failed to export');

        await handleExport(request, response);

        expect(exportEverything).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to export' });
    });
});
