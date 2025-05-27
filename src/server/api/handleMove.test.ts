/** @jest-environment node */
import { getDetailsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { handleMove } from '~/server/api/handleMove';
import { getDetailsWithYears } from '~/server/api/response';
import { moveDetailsOccurrences } from '~/server/data/common';
import { type ApiDetailsWithYears, type ApiMoveDetails } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/api/response');
jest.mock('~/server/data/common');
jest.mock('~/server/data/details');

describe('handleMove', () => {
    const request = mockRequest<ApiMoveDetails>({ group: 'Uogienės', name: 'Braškės', newGroup: 'Daržovės' });
    const response = mockResponse<ApiDetailsWithYears>();
    const years = getYearsFixture();
    const details = getDetailsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(moveDetailsOccurrences).mockResolvedValueOnce(true);
        jest.mocked(getDetailsWithYears).mockResolvedValueOnce({ years, details });

        await handleMove(request, response);

        expect(moveDetailsOccurrences).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Daržovės', undefined);
        expect(getDetailsWithYears).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(moveDetailsOccurrences).mockResolvedValueOnce(false);

        await handleMove(request, response);

        expect(moveDetailsOccurrences).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Daržovės', undefined);
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(moveDetailsOccurrences).mockRejectedValueOnce('Failed to move');

        await handleMove(request, response);

        expect(moveDetailsOccurrences).toHaveBeenCalledWith('Uogienės', 'Braškės', 'Daržovės', undefined);
        expect(getDetailsWithYears).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to move' });
    });
});
