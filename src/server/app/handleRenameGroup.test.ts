/** @jest-environment node */
import { type ApiDetails, type ApiRenameGroup } from '~/common/api';
import { handleRenameGroup } from '~/server/app/handleRenameGroup';
import { renameGroupOccurrences } from '~/server/data/common';
import { getYearsAndDetails } from '~/server/data/details';
import { getTestDetails, getTestYears } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/data/details');

describe('handleRenameGroup', () => {
    const request = mockRequest<ApiRenameGroup>({ group: 'G', newGroup: 'H' });
    const response = mockResponse<ApiDetails>();
    const years = getTestYears();
    const details = getTestDetails();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (renameGroupOccurrences as jest.Mock).mockResolvedValueOnce(true);
        (getYearsAndDetails as jest.Mock).mockResolvedValueOnce({ years, details });

        await handleRenameGroup(request, response);

        expect(renameGroupOccurrences).toHaveBeenCalledWith('G', 'H');
        expect(getYearsAndDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        (renameGroupOccurrences as jest.Mock).mockResolvedValueOnce(false);

        await handleRenameGroup(request, response);

        expect(renameGroupOccurrences).toHaveBeenCalledWith('G', 'H');
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (renameGroupOccurrences as jest.Mock).mockRejectedValueOnce('Failed to rename group');

        await handleRenameGroup(request, response);

        expect(renameGroupOccurrences).toHaveBeenCalledWith('G', 'H');
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to rename group' });
    });
});
