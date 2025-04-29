/** @jest-environment node */

import { getDetailsFixture, getGroupsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { type ApiDetailsWithYears } from '~/common/api';
import { handleDetails } from '~/server/app/handleDetails';
import { getAllDetails } from '~/server/data/details';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');

describe('handleDetails', () => {
    const request = mockRequest();
    const response = mockResponse<ApiDetailsWithYears>();
    const years = getYearsFixture();
    const groups = getGroupsFixture();
    const variants = getVariantsFixture();
    const details = getDetailsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(getAllDetails).mockResolvedValueOnce({ years, groups, variants, details });

        await handleDetails(request, response);

        expect(getAllDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, groups, variants, details });
    });

    it('returns empty response on failure', async () => {
        await handleDetails(request, response);

        expect(getAllDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        jest.mocked(getAllDetails).mockRejectedValueOnce('Failed to get details');

        await handleDetails(request, response);

        expect(getAllDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to get details' });
    });
});
