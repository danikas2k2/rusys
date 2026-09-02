// @vitest-environment node
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import type { ApiVariants } from '~/common/api';
import { handleVariants } from '~/server/api/handleVariants';
import { getVariantsWithGroups } from '~/server/api/response';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/products'));
vi.mock(import('~/server/data/variants'));

describe('handleVariants', () => {
    const request = mockRequest();
    const response = mockResponse<ApiVariants>();
    const variants = getVariantsFixture();
    const groups = getGroupsFixture();

    afterEach(() => vi.clearAllMocks());

    it('returns filled response on success', async () => {
        vi.mocked(getVariantsWithGroups).mockResolvedValueOnce({ groups, variants });

        await handleVariants(request, response);

        expect(getVariantsWithGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, groups, variants });
    });

    it('returns empty response on failure', async () => {
        await handleVariants(request, response);

        expect(getVariantsWithGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        vi.mocked(getVariantsWithGroups).mockRejectedValueOnce('Failed to get variants');

        await handleVariants(request, response);

        expect(getVariantsWithGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get variants' });
    });
});
