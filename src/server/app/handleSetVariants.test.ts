/** @jest-environment node */
import { getVariantsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { type ApiVariants } from '~/common/api';
import { handleSetVariants } from '~/server/app/handleSetVariants';
import { getVariantsResponse, setVariants } from '~/server/data/variants';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/variants');

describe('handleSetVariants', () => {
    const variants = getVariantsFixture();
    const request = mockRequest<ApiVariants>({ variants });
    const response = mockResponse<ApiVariants>();

    afterEach(() => jest.clearAllMocks());

    it('returns filled response on success', async () => {
        jest.mocked(setVariants).mockResolvedValueOnce(true);
        jest.mocked(getVariantsResponse).mockResolvedValueOnce({ variants });

        await handleSetVariants(request, response);

        expect(setVariants).toHaveBeenCalledWith(variants);
        expect(getVariantsResponse).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, variants });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(setVariants).mockResolvedValueOnce(false);

        await handleSetVariants(request, response);

        expect(setVariants).toHaveBeenCalledWith(variants);
        expect(getVariantsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(setVariants).mockRejectedValueOnce('Failed to set variants');

        await handleSetVariants(request, response);

        expect(setVariants).toHaveBeenCalledWith(variants);
        expect(getVariantsResponse).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to set variants' });
    });
});
