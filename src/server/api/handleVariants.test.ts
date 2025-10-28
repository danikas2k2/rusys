/** @jest-environment node */
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleVariants } from '~/server/api/handleVariants';
import { getVariantsWithGroups } from '~/server/api/response';
import type { ApiVariants } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/api/response');
jest.mock('~/server/data/details');
jest.mock('~/server/data/variants');

describe('handleVariants', () => {
    const request = mockRequest();
    const response = mockResponse<ApiVariants>();
    const variants = getVariantsFixture();
    const groups = getGroupsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(getVariantsWithGroups).mockResolvedValueOnce({ groups, variants });

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
        jest.mocked(getVariantsWithGroups).mockRejectedValueOnce('Failed to get variants');

        await handleVariants(request, response);

        expect(getVariantsWithGroups).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get variants' });
    });
});
