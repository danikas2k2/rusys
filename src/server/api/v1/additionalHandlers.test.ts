import { NextRequest } from 'next/server';

import { runApiHandler, type ApiHandler } from '~/server/api/next';
import { handleDeleteGroup } from '~/server/api/v1/groups/handleDeleteGroup';
import { handlePutGroupsOrder } from '~/server/api/v1/groups/handlePutGroupsOrder';
import { handleGetProductHistory } from '~/server/api/v1/products/handleGetProductHistory';
import { handlePostAmountHistoryRedo } from '~/server/api/v1/products/handlePostAmountHistoryRedo';
import { handlePostAmountHistoryUndo } from '~/server/api/v1/products/handlePostAmountHistoryUndo';
import { handlePutProductImage } from '~/server/api/v1/products/handlePutProductImage';
import { handlePutProductVariantImage } from '~/server/api/v1/products/handlePutProductVariantImage';
import { handleGetProductSummaryHistory } from '~/server/api/v1/summary/handleGetProductSummaryHistory';
import { handleGetUserProfiles } from '~/server/api/v1/users/handleGetUserProfiles';
import { handleDeleteVariant } from '~/server/api/v1/variants/handleDeleteVariant';
import { handleGetVariants } from '~/server/api/v1/variants/handleGetVariants';
import { handlePostVariantCopy } from '~/server/api/v1/variants/handlePostVariantCopy';
import { handlePutVariantsOrder } from '~/server/api/v1/variants/handlePutVariantsOrder';
import { deleteGroupOccurrences } from '~/server/data/common';
import { reorderGroups } from '~/server/data/groups';
import {
    getProductUndates,
    getProductUpdates,
    redoProduct,
    setImage,
    setVariantImage,
    undoProduct,
} from '~/server/data/products';
import { getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';
import { getUserProfiles } from '~/server/data/userProfiles';
import { copyVariant, deleteVariant, getVariants, reorderVariants } from '~/server/data/variants';

vi.mock(import('~/server/data/common'), () => ({ deleteGroupOccurrences: vi.fn() }));
vi.mock(import('~/server/data/groups'), () => ({ reorderGroups: vi.fn() }));
vi.mock(import('~/server/data/products'), () => ({
    getProductUndates: vi.fn(),
    getProductUpdates: vi.fn(),
    redoProduct: vi.fn(),
    setImage: vi.fn(),
    setVariantImage: vi.fn(),
    undoProduct: vi.fn(),
}));
vi.mock(import('~/server/data/summary'), () => ({ getSummaryUndates: vi.fn(), getSummaryUpdates: vi.fn() }));
vi.mock(import('~/server/data/userProfiles'), () => ({ getUserProfiles: vi.fn() }));
vi.mock(import('~/server/data/variants'), () => ({
    copyVariant: vi.fn(),
    deleteVariant: vi.fn(),
    getVariants: vi.fn(),
    reorderVariants: vi.fn(),
}));

const productParams = { group: 'Uogienės', name: 'Avietės', year: '26' };

async function call(
    handler: ApiHandler,
    method: string,
    params: Record<string, string> = {},
    body?: unknown,
    query = ''
) {
    const request = new NextRequest(`http://localhost/api/v1/test${query}`, {
        method,
        ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
    return runApiHandler(request, handler, params);
}

describe('remaining API route contracts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('archives a category and applies its explicit order', async () => {
        vi.mocked(deleteGroupOccurrences).mockResolvedValue(true);
        vi.mocked(reorderGroups).mockResolvedValue(true);
        const order = { Uogienės: 2, Daržovės: 1 };

        expect((await call(handleDeleteGroup, 'DELETE', { group: 'Uogienės' })).status).toBe(204);
        expect(deleteGroupOccurrences).toHaveBeenCalledWith('Uogienės');
        expect((await call(handlePutGroupsOrder, 'PUT', {}, { groups: order })).status).toBe(204);
        expect(reorderGroups).toHaveBeenCalledWith(order);
    });

    it('returns the selected product year history', async () => {
        vi.mocked(getProductUpdates).mockResolvedValue([]);
        vi.mocked(getProductUndates).mockResolvedValue([]);
        const response = await call(handleGetProductHistory, 'GET', productParams);

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toStrictEqual({ updates: [], undates: [] });
        expect(getProductUpdates).toHaveBeenCalledWith('Uogienės', 'Avietės', 26);
        expect(getProductUndates).toHaveBeenCalledWith('Uogienės', 'Avietės', 26);
    });

    it('undoes and redoes a product history change for the selected year', async () => {
        vi.mocked(undoProduct).mockResolvedValue(true);
        vi.mocked(redoProduct).mockResolvedValue(true);

        expect((await call(handlePostAmountHistoryUndo, 'POST', productParams)).status).toBe(204);
        expect(undoProduct).toHaveBeenCalledWith('Uogienės', 'Avietės', 26);
        expect((await call(handlePostAmountHistoryRedo, 'POST', productParams)).status).toBe(204);
        expect(redoProduct).toHaveBeenCalledWith('Uogienės', 'Avietės', 26);
    });

    it('sets product and variant images, including an explicit removal', async () => {
        vi.mocked(setImage).mockResolvedValue(true);
        vi.mocked(setVariantImage).mockResolvedValue(true);

        expect((await call(handlePutProductImage, 'PUT', productParams, { image: '' })).status).toBe(204);
        expect(setImage).toHaveBeenCalledWith('Uogienės', 'Avietės', '');
        expect(
            (
                await call(
                    handlePutProductVariantImage,
                    'PUT',
                    { ...productParams, variant: 'Stiklainis' },
                    { image: '/images/icon.png' }
                )
            ).status
        ).toBe(204);
        expect(setVariantImage).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Stiklainis', '/images/icon.png');
    });

    it('returns the selected summary history', async () => {
        vi.mocked(getSummaryUpdates).mockResolvedValue([]);
        vi.mocked(getSummaryUndates).mockResolvedValue([]);
        const response = await call(handleGetProductSummaryHistory, 'GET', productParams);

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toStrictEqual({ updates: [], undates: [] });
        expect(getSummaryUpdates).toHaveBeenCalledWith('Uogienės', 'Avietės', 26);
        expect(getSummaryUndates).toHaveBeenCalledWith('Uogienės', 'Avietės', 26);
    });

    it('passes repeated email filters to profile lookup', async () => {
        vi.mocked(getUserProfiles).mockResolvedValue([]);
        const response = await call(
            handleGetUserProfiles,
            'GET',
            {},
            undefined,
            '?email=first@example.com&email=second@example.com'
        );

        expect(response.status).toBe(200);
        expect(getUserProfiles).toHaveBeenCalledWith(['first@example.com', 'second@example.com']);
    });

    it('deletes, copies and reorders variants in the selected category', async () => {
        vi.mocked(deleteVariant).mockResolvedValue(true);
        vi.mocked(copyVariant).mockResolvedValue(true);
        vi.mocked(reorderVariants).mockResolvedValue(true);
        const params = { group: 'Uogienės', variant: 'Stiklainis' };

        expect((await call(handleDeleteVariant, 'DELETE', params)).status).toBe(204);
        expect(deleteVariant).toHaveBeenCalledWith('Uogienės', 'Stiklainis');
        expect(
            (
                await call(handlePostVariantCopy, 'POST', params, {
                    newGroup: 'Daržovės',
                    newVariant: 'Indelis',
                    count: 2,
                })
            ).status
        ).toBe(204);
        expect(copyVariant).toHaveBeenCalledWith('Uogienės', 'Stiklainis', 'Daržovės', 'Indelis', {
            order: undefined,
            suffix: undefined,
            count: 2,
            units: undefined,
        });
        expect(
            (await call(handlePutVariantsOrder, 'PUT', { group: 'Uogienės' }, { variants: { Stiklainis: 1 } })).status
        ).toBe(204);
        expect(reorderVariants).toHaveBeenCalledWith('Uogienės', { Stiklainis: 1 });
    });

    it('returns all variants or those matching a category', async () => {
        const variants = [
            { group: 'Uogienės', variant: 'Stiklainis', order: 1 },
            { group: 'Daržovės', variant: 'Indelis', order: 1 },
        ];
        vi.mocked(getVariants).mockResolvedValue(variants);

        const all = await call(handleGetVariants, 'GET');
        const filtered = await call(handleGetVariants, 'GET', {}, undefined, '?group=Uogien%C4%97s');

        await expect(all.json()).resolves.toStrictEqual({ variants });
        await expect(filtered.json()).resolves.toStrictEqual({ variants: [variants[0]] });
    });
});
