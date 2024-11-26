/** @jest-environment node */
import { type ApiDetails, type ApiRenameVariant } from '~/common/api';
import { handleRenameVariant } from '~/server/app/handleRenameVariant';
import { renameVariantOccurrences } from '~/server/data/common';
import { getDetailsWithYears } from '~/server/data/details';
import { getVariantsResponse } from '~/server/data/variants';
import { getDetailsFixture, getVariantsFixture, getYearsFixture } from '~/tests/fixtures';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/data/variants');

describe('handleRenameVariant', () => {
    const request = mockRequest<ApiRenameVariant>({
        group: 'G',
        variant: 'd',
        newVariant: '3/4',
        order: 7,
        long: 'Long',
        short: 'Short',
    });
    const response = mockResponse<ApiDetails>();
    const years = getYearsFixture();
    const details = getDetailsFixture();
    const variants = getVariantsFixture();

    afterEach(() => jest.clearAllMocks());

    const update = {
        order: 7,
        long: 'Long',
        short: 'Short',
    };

    it('returns filled response on success', async () => {
        (renameVariantOccurrences as jest.Mock).mockResolvedValueOnce(true);
        (getVariantsResponse as jest.Mock).mockResolvedValueOnce({ years, details, variants });

        await handleRenameVariant(request, response);

        expect(renameVariantOccurrences).toHaveBeenCalledWith('G', 'd', '3/4', update);
        expect(getVariantsResponse).toHaveBeenCalledWith(true);
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details, variants });
    });

    it('returns empty response on failure', async () => {
        (renameVariantOccurrences as jest.Mock).mockResolvedValueOnce(false);

        await handleRenameVariant(request, response);

        expect(renameVariantOccurrences).toHaveBeenCalledWith('G', 'd', '3/4', update);
        expect(getVariantsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        (renameVariantOccurrences as jest.Mock).mockRejectedValueOnce('Failed to rename variant');

        await handleRenameVariant(request, response);

        expect(renameVariantOccurrences).toHaveBeenCalledWith('G', 'd', '3/4', update);
        expect(getVariantsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to rename variant' });
    });
});
