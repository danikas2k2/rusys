/** @jest-environment node */
import { getDetailsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleCopyVariant } from '~/server/api/handleCopyVariant';
import { getDetailsWithVariants } from '~/server/api/response';
import { copyVariant } from '~/server/data/variants';
import type { ApiCopyVariant, ApiDetailsWithVariants } from '~/types/api';

jest.mock('~/server/api/debug');
jest.mock('~/server/api/response');
jest.mock('~/server/data/variants');

describe('handleCopyVariant', () => {
    const request = mockRequest<ApiCopyVariant>({ group: 'Uogienės', variant: 'Trilitris', newGroup: 'Daržovės' });
    const response = mockResponse<ApiDetailsWithVariants>();
    const years = getYearsFixture();
    const details = getDetailsFixture();
    const variants = getVariantsFixture();

    beforeEach(() => {
        jest.mocked(copyVariant).mockResolvedValue(true);
        jest.mocked(getDetailsWithVariants).mockResolvedValue({ years, details, variants });
    });

    afterEach(() => jest.clearAllMocks());

    it('copies variant to different group and returns updated details with years and variants', async () => {
        await handleCopyVariant(request, response);

        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Trilitris', 'Daržovės', undefined, {});
        expect(getDetailsWithVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details, variants });
    });

    it('copies variant to different group with new name and returns updated details with years and variants', async () => {
        await handleCopyVariant(
            mockRequest<ApiCopyVariant>({
                group: 'Uogienės',
                variant: 'Trilitris',
                newGroup: 'Daržovės',
                newVariant: '3L',
            }),
            response
        );

        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Trilitris', 'Daržovės', '3L', {});
        expect(getDetailsWithVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details, variants });
    });

    it('copies variant to different group with additional fields and returns updated details with years and variants', async () => {
        await handleCopyVariant(
            mockRequest<ApiCopyVariant>({
                group: 'Uogienės',
                variant: 'Trilitris',
                newGroup: 'Daržovės',
                suffix: '3l',
                order: 5,
            }),
            response
        );

        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Trilitris', 'Daržovės', undefined, {
            suffix: '3l',
            order: 5,
        });
        expect(getDetailsWithVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details, variants });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(copyVariant).mockResolvedValueOnce(false);

        await handleCopyVariant(request, response);

        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Trilitris', 'Daržovės', undefined, {});
        expect(getDetailsWithVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(copyVariant).mockRejectedValueOnce('Failed to add');

        await handleCopyVariant(request, response);

        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Trilitris', 'Daržovės', undefined, {});
        expect(getDetailsWithVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to add' });
    });
});
