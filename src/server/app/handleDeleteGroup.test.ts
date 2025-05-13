/** @jest-environment node */
import { getDetailsFixture, getGroupsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { type ApiDetailsWithYears, type ApiRequestGroup } from '~/common/api';
import { handleDeleteGroup } from '~/server/app/handleDeleteGroup';
import { deleteGroupOccurrences } from '~/server/data/common';
import { getAllDetails } from '~/server/data/details';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/data/details');
jest.mock('~/server/data/groups');

describe('handleDeleteGroup', () => {
    const request = mockRequest<ApiRequestGroup>({ group: 'Uogienės' });
    const response = mockResponse<ApiDetailsWithYears>();
    const years = getYearsFixture();
    const details = getDetailsFixture();
    const variants = getVariantsFixture();
    const groups = getGroupsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(deleteGroupOccurrences).mockResolvedValueOnce(true);
        jest.mocked(getAllDetails).mockResolvedValueOnce({ years, details, variants, groups });

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('Uogienės');
        expect(getAllDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details, variants, groups });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(deleteGroupOccurrences).mockResolvedValueOnce(false);

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('Uogienės');
        expect(getAllDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(deleteGroupOccurrences).mockRejectedValueOnce('Failed to delete group');

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('Uogienės');
        expect(getAllDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to delete group' });
    });
});
