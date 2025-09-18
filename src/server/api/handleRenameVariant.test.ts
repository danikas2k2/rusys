/** @jest-environment node */
import { getDetailsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleRenameVariant } from '~/server/api/handleRenameVariant';
import { getDetailsWithVariants } from '~/server/api/response';
import { renameVariantOccurrences } from '~/server/data/common';
import { type ApiDetailsWithYears, type ApiRenameVariant } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/api/response');
jest.mock('~/server/data/common');
jest.mock('~/server/data/variants');

describe('handleRenameVariant', () => {
    const request = mockRequest<ApiRenameVariant>({
        group: 'Uogienės',
        variant: 'd',
        newVariant: '3/4',
        order: 7,
        suffix: 'Suffix',
    });
    const response = mockResponse<ApiDetailsWithYears>();
    const years = getYearsFixture();
    const details = getDetailsFixture();
    const variants = getVariantsFixture();

    afterEach(() => jest.clearAllMocks());

    const update = {
        order: 7,
        suffix: 'Suffix',
    };

    it('returns filled response on success', async () => {
        jest.mocked(renameVariantOccurrences).mockResolvedValueOnce(true);
        jest.mocked(getDetailsWithVariants).mockResolvedValueOnce({ years, details, variants });

        await handleRenameVariant(request, response);

        expect(renameVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'd', '3/4', update);
        expect(getDetailsWithVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details, variants });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(renameVariantOccurrences).mockResolvedValueOnce(false);

        await handleRenameVariant(request, response);

        expect(renameVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'd', '3/4', update);
        expect(getDetailsWithVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(renameVariantOccurrences).mockRejectedValueOnce('Failed to rename variant');

        await handleRenameVariant(request, response);

        expect(renameVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'd', '3/4', update);
        expect(getDetailsWithVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to rename variant' });
    });
});
