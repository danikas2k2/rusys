/** @jest-environment node */
import { type ApiDetails, type ApiMoveDetails } from '~/common/api';
import { handleMove } from '~/server/app/handleMove';
import { moveDetailsOccurrences } from '~/server/data/common';
import { getDetailsWithYears } from '~/server/data/details';
import { getDetailsFixture, getVariantsFixture, getYearsFixture } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/data/details');

describe('handleMove', () => {
    const request = mockRequest<ApiMoveDetails>({ group: 'G', name: 'A', newGroup: 'H' });
    const response = mockResponse<ApiDetails>();
    const years = getYearsFixture();
    const details = getDetailsFixture();
    const variants = getVariantsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (moveDetailsOccurrences as jest.Mock).mockResolvedValueOnce(true);
        (getDetailsWithYears as jest.Mock).mockResolvedValueOnce({ years, details, variants });

        await handleMove(request, response);

        expect(moveDetailsOccurrences).toHaveBeenCalledWith('G', 'A', 'H', undefined);
        expect(getDetailsWithYears).toHaveBeenCalledWith(true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details, variants });
    });

    it('returns empty response on failure', async () => {
        (moveDetailsOccurrences as jest.Mock).mockResolvedValueOnce(false);

        await handleMove(request, response);

        expect(moveDetailsOccurrences).toHaveBeenCalledWith('G', 'A', 'H', undefined);
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        (moveDetailsOccurrences as jest.Mock).mockRejectedValueOnce('Failed to move');

        await handleMove(request, response);

        expect(moveDetailsOccurrences).toHaveBeenCalledWith('G', 'A', 'H', undefined);
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to move' });
    });
});
