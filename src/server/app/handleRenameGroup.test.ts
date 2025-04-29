/** @jest-environment node */

import { getDetailsFixture, getGroupsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { type ApiDetailsWithYears, type ApiRenameGroup } from '~/common/api';
import { handleRenameGroup } from '~/server/app/handleRenameGroup';
import { renameGroupOccurrences } from '~/server/data/common';
import { getAllDetails } from '~/server/data/details';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/data/details');
jest.mock('~/server/data/groups');

describe('handleRenameGroup', () => {
    const request = mockRequest<ApiRenameGroup>({ group: 'Uogienės', newGroup: 'H' });
    const response = mockResponse<ApiDetailsWithYears>();
    const years = getYearsFixture();
    const details = getDetailsFixture();
    const variants = getVariantsFixture();
    const groups = getGroupsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(renameGroupOccurrences).mockResolvedValueOnce(true);
        jest.mocked(getAllDetails).mockResolvedValueOnce({ years, details, variants, groups });

        await handleRenameGroup(request, response);

        expect(renameGroupOccurrences).toHaveBeenCalledWith('Uogienės', 'H');
        expect(getAllDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details, variants, groups });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(renameGroupOccurrences).mockResolvedValueOnce(false);

        await handleRenameGroup(request, response);

        expect(renameGroupOccurrences).toHaveBeenCalledWith('Uogienės', 'H');
        expect(getAllDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(renameGroupOccurrences).mockRejectedValueOnce('Failed to rename group');

        await handleRenameGroup(request, response);

        expect(renameGroupOccurrences).toHaveBeenCalledWith('Uogienės', 'H');
        expect(getAllDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to rename group' });
    });
});
