/** @jest-environment node */
import { type ApiVariants } from '~/common/api';
import { handleSetVariants } from '~/server/app/handleSetVariants';
import { getVariantsFixture } from '~/tests/fixtures';
import { getVariants, setVariants } from '~/server/data/variants';
import { mockRequest } from '~/tests/mockRequest';
import { mockResponse } from '~/tests/mockResponse';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/variants');

describe('handleSetVariants', () => {
    const variants = getVariantsFixture();
    const request = mockRequest<ApiVariants>({ variants });
    const response = mockResponse<ApiVariants>();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        (setVariants as jest.Mock).mockResolvedValueOnce(true);
        (getVariants as jest.Mock).mockResolvedValueOnce(variants);

        await handleSetVariants(request, response);

        expect(setVariants).toHaveBeenCalledWith(variants);
        expect(getVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, variants });
    });

    it('returns empty response on failure', async () => {
        (setVariants as jest.Mock).mockResolvedValueOnce(false);

        await handleSetVariants(request, response);

        expect(setVariants).toHaveBeenCalledWith(variants);
        expect(getVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });

    it('returns error response on error', async () => {
        (setVariants as jest.Mock).mockRejectedValueOnce('Failed to set variants');

        await handleSetVariants(request, response);

        expect(setVariants).toHaveBeenCalledWith(variants);
        expect(getVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to set variants' });
    });
});
