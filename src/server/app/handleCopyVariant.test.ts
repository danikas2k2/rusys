/** @jest-environment node */

import { getDetailsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';
import { type ApiCopyVariant, type ApiDetailsWithVariants } from '~/common/api';
import { handleCopyVariant } from '~/server/app/handleCopyVariant';
import { copyVariant, getDetailsAndVariants } from '~/server/data/variants';

jest.mock('~/server/app/debug');
jest.mock('~/server/data/variants');

describe('handleCopyVariant', () => {
    const request = mockRequest<ApiCopyVariant>({ group: 'Uogienės', variant: 'Trilitris', newGroup: 'Daržovės' });
    const response = mockResponse<ApiDetailsWithVariants>();
    const years = getYearsFixture();
    const details = getDetailsFixture();
    const variants = getVariantsFixture();

    beforeEach(() => {
        jest.mocked(copyVariant).mockResolvedValue(true);
        jest.mocked(getDetailsAndVariants).mockResolvedValue({ years, details, variants });
    });

    afterEach(() => jest.clearAllMocks());

    it('copies variant to different group and returns updated details with years and variants', async () => {
        await handleCopyVariant(request, response);

        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Trilitris', 'Daržovės', undefined, {});
        expect(getDetailsAndVariants).toHaveBeenCalledWith();
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
        expect(getDetailsAndVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details, variants });
    });

    it('copies variant to different group with additional fields and returns updated details with years and variants', async () => {
        await handleCopyVariant(
            mockRequest<ApiCopyVariant>({
                group: 'Uogienės',
                variant: 'Trilitris',
                newGroup: 'Daržovės',
                short: '3l',
                long: '3 L.',
                order: 5,
            }),
            response
        );

        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Trilitris', 'Daržovės', undefined, {
            short: '3l',
            long: '3 L.',
            order: 5,
        });
        expect(getDetailsAndVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details, variants });
    });

    it('returns empty response on failure', async () => {
        jest.mocked(copyVariant).mockResolvedValueOnce(false);

        await handleCopyVariant(request, response);

        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Trilitris', 'Daržovės', undefined, {});
        expect(getDetailsAndVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        jest.mocked(copyVariant).mockRejectedValueOnce('Failed to add');

        await handleCopyVariant(request, response);

        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Trilitris', 'Daržovės', undefined, {});
        expect(getDetailsAndVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to add' });
    });
});
