/** @vitest-environment node */
import { getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import type { ApiCopyVariant, ApiProductsWithVariants } from '@rusys/common/api';

import { handleCopyVariant } from '~/server/api/handleCopyVariant';
import { getProductsWithVariants } from '~/server/api/response';
import { copyVariant } from '~/server/data/variants';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/variants'));

describe('handleCopyVariant', () => {
    const request = mockRequest<ApiCopyVariant>({ group: 'Uogienės', variant: 'Trilitris', newGroup: 'Daržovės' });
    const response = mockResponse<ApiProductsWithVariants>();
    const years = getYearsFixture();
    const products = getProductsFixture();
    const variants = getVariantsFixture();

    beforeEach(() => {
        vi.mocked(copyVariant).mockResolvedValue(true);
        vi.mocked(getProductsWithVariants).mockResolvedValue({ years, products, variants });
    });

    afterEach(() => vi.clearAllMocks());

    it('copies variant to different group and returns updated products with years and variants', async () => {
        await handleCopyVariant(request, response);

        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Trilitris', 'Daržovės', undefined, {});
        expect(getProductsWithVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products, variants });
    });

    it('copies variant to different group with new name and returns updated products with years and variants', async () => {
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
        expect(getProductsWithVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products, variants });
    });

    it('copies variant to different group with additional fields and returns updated products with years and variants', async () => {
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
        expect(getProductsWithVariants).toHaveBeenCalledWith();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, products, variants });
    });

    it('returns empty response on failure', async () => {
        vi.mocked(copyVariant).mockResolvedValueOnce(false);

        await handleCopyVariant(request, response);

        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Trilitris', 'Daržovės', undefined, {});
        expect(getProductsWithVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: true });
    });

    it('returns error response on error', async () => {
        vi.mocked(copyVariant).mockRejectedValueOnce('Failed to add');

        await handleCopyVariant(request, response);

        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Trilitris', 'Daržovės', undefined, {});
        expect(getProductsWithVariants).not.toHaveBeenCalled();
        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Failed to add' });
    });
});
