/** @jest-environment node */
import { type ApiRequestVariant, type ApiDetails } from '~/common/api';
import { handleDeleteVariant } from '~/server/app/handleDeleteVariant';
import { deleteVariantOccurrences } from '~/server/data/common';
import { getYearsAndDetails } from '~/server/data/details';
import { getDetailsFixture, getYearsFixture } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/data/details');

describe('handleDeleteVariant', () => {
    const request = mockRequest<ApiRequestVariant>({ group: 'G', variant: 'd' });
    const response = mockResponse<ApiDetails>();
    const years = getYearsFixture();
    const details = getDetailsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (deleteVariantOccurrences as jest.Mock).mockResolvedValueOnce(true);
        (getYearsAndDetails as jest.Mock).mockResolvedValueOnce({ years, details });

        await handleDeleteVariant(request, response);

        expect(deleteVariantOccurrences).toHaveBeenCalledWith('G', 'd');
        expect(getYearsAndDetails).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('returns empty response on failure', async () => {
        (deleteVariantOccurrences as jest.Mock).mockResolvedValueOnce(false);

        await handleDeleteVariant(request, response);

        expect(deleteVariantOccurrences).toHaveBeenCalledWith('G', 'd');
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (deleteVariantOccurrences as jest.Mock).mockRejectedValueOnce('Failed to delete variant');

        await handleDeleteVariant(request, response);

        expect(deleteVariantOccurrences).toHaveBeenCalledWith('G', 'd');
        expect(getYearsAndDetails).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to delete variant' });
    });
});
