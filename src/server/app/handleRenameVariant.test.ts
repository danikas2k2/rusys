/** @jest-environment node */
import { type ApiDetails, type ApiRenameVariant } from '~/common/api';
import { handleRenameVariant } from '~/server/app/handleRenameVariant';
import { renameVariantOccurrences } from '~/server/data/common';
import { getYearsAndDetails } from '~/server/data/details';
import { getTestDetails, getTestYears } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/data/details');

describe('handleRenameVariant', () => {
    const request = mockRequest<ApiRenameVariant>({ group: 'G', variant: 'd', newVariant: '3/4' });
    const response = mockResponse<ApiDetails>();
    const years = getTestYears();
    const details = getTestDetails();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (renameVariantOccurrences as jest.Mock).mockResolvedValueOnce(true);
        (getYearsAndDetails as jest.Mock).mockResolvedValueOnce({ years, details });

        await handleRenameVariant(request, response);

        expect(renameVariantOccurrences).toHaveBeenCalledWith('G', 'd', '3/4');
        expect(getYearsAndDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        (renameVariantOccurrences as jest.Mock).mockResolvedValueOnce(false);

        await handleRenameVariant(request, response);

        expect(renameVariantOccurrences).toHaveBeenCalledWith('G', 'd', '3/4');
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (renameVariantOccurrences as jest.Mock).mockRejectedValueOnce('Failed to rename variant');

        await handleRenameVariant(request, response);

        expect(renameVariantOccurrences).toHaveBeenCalledWith('G', 'd', '3/4');
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to rename variant' });
    });
});
