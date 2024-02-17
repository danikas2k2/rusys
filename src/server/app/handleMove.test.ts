/** @jest-environment node */
import { type ApiRequest, type ApiDetails, type ApiMoveDetails } from '~/common/api';
import { handleMove } from '~/server/app/handleMove';
import { getYearsAndDetails, moveDetails } from '~/server/data/details';
import { getTestDetails, getTestYears } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');

describe('handleMove', () => {
    const request = mockRequest<ApiMoveDetails>({ group: 'G', name: 'A', newGroup: 'H' });
    const response = mockResponse<ApiDetails>();
    const years = getTestYears();
    const details = getTestDetails();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (moveDetails as jest.Mock).mockResolvedValueOnce(true);
        (getYearsAndDetails as jest.Mock).mockResolvedValueOnce({ years, details });

        await handleMove(request, response);

        expect(moveDetails).toHaveBeenCalledWith('G', 'A', 'H');
        expect(getYearsAndDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        (moveDetails as jest.Mock).mockResolvedValueOnce(false);

        await handleMove(request, response);

        expect(moveDetails).toHaveBeenCalledWith('G', 'A', 'H');
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (moveDetails as jest.Mock).mockRejectedValueOnce('Failed to move');

        await handleMove(request, response);

        expect(moveDetails).toHaveBeenCalledWith('G', 'A', 'H');
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to move' });
    });
});
