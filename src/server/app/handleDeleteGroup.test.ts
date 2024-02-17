/** @jest-environment node */
import { type ApiRequestGroup, type ApiDetails } from '~/common/api';
import { handleDeleteGroup } from '~/server/app/handleDeleteGroup';
import { deleteGroupOccurrences } from '~/server/data/common';
import { getYearsAndDetails } from '~/server/data/details';
import { getTestDetails, getTestYears } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/data/details');

describe('handleDeleteGroup', () => {
    const request = mockRequest<ApiRequestGroup>({ group: 'G' });
    const response = mockResponse<ApiDetails>();
    const years = getTestYears();
    const details = getTestDetails();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (deleteGroupOccurrences as jest.Mock).mockResolvedValueOnce(true);
        (getYearsAndDetails as jest.Mock).mockResolvedValueOnce({ years, details });

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('G');
        expect(getYearsAndDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        (deleteGroupOccurrences as jest.Mock).mockResolvedValueOnce(false);

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('G');
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (deleteGroupOccurrences as jest.Mock).mockRejectedValueOnce('Failed to delete group');

        await handleDeleteGroup(request, response);

        expect(deleteGroupOccurrences).toHaveBeenCalledWith('G');
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to delete group' });
    });
});
