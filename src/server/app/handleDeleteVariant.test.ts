/** @jest-environment node */
import { getDetailsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { type ApiDetailsWithYears, type ApiRequestVariant } from '~/common/api';
import { handleDeleteVariant } from '~/server/app/handleDeleteVariant';
import { deleteVariantOccurrences } from '~/server/data/common';
import { getDetailsAndVariants } from '~/server/data/variants';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/data/variants');

describe('handleDeleteVariant', () => {
    const request = mockRequest<ApiRequestVariant>({ group: 'Uogienės', variant: 'd' });
    const response = mockResponse<ApiDetailsWithYears>();
    const years = getYearsFixture();
    const details = getDetailsFixture();
    const variants = getVariantsFixture();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(deleteVariantOccurrences).mockResolvedValueOnce(true);
        jest.mocked(getDetailsAndVariants).mockResolvedValueOnce({ years, details, variants });

        await handleDeleteVariant(request, response);

        expect(deleteVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'd');
        expect(getDetailsAndVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details, variants });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(deleteVariantOccurrences).mockResolvedValueOnce(false);

        await handleDeleteVariant(request, response);

        expect(deleteVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'd');
        expect(getDetailsAndVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(deleteVariantOccurrences).mockRejectedValueOnce('Failed to delete variant');

        await handleDeleteVariant(request, response);

        expect(deleteVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'd');
        expect(getDetailsAndVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to delete variant' });
    });
});
