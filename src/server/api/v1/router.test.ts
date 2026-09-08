// @vitest-environment node
import express from 'express';
import fileUpload from 'express-fileupload';
import request from 'supertest';

import { getProductsWithYears } from '~/server/api/response';
import { createV1Router } from '~/server/api/v1/router';
import {
    deleteGroupOccurrences,
    importEverything,
    moveProductOccurrences,
    renameGroupOccurrences,
} from '~/server/data/common';
import { buildExportArchive, readImportArchive, writeImportImages } from '~/server/data/exportArchive';
import { getGroups, reorderGroups, updateGroup } from '~/server/data/groups';
import {
    addProduct,
    deleteProduct,
    getProductUndates,
    getProductUpdates,
    moveConsumedToRecycled,
    redoProduct,
    renameProduct,
    setAmounts,
    setImage,
    setMissing,
    setMissingBulk,
    setProductExpiryTolerance,
    setProductParent,
    setRemoving,
    setVariantImage,
    undoProduct,
} from '~/server/data/products';
import { getValidator } from '~/server/data/schema/getValidator';
import { getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';
import { getUserProfiles, upsertUserProfile } from '~/server/data/userProfiles';
import { copyVariant, deleteVariant, getVariants, reorderVariants, updateVariant } from '~/server/data/variants';

vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/common'));
vi.mock(import('~/server/data/groups'));
vi.mock(import('~/server/data/exportArchive'));
vi.mock(import('~/server/data/schema/getValidator'));
vi.mock(import('~/server/data/products'));
vi.mock(import('~/server/data/summary'));
vi.mock(import('~/server/data/userProfiles'));
vi.mock(import('~/server/data/variants'));

describe('v1 router', () => {
    const app = express().use(express.json()).use('/api/v1', createV1Router());

    afterEach(() => vi.clearAllMocks());

    it('returns resources through GET with the strict cache policy', async () => {
        vi.mocked(getGroups).mockResolvedValueOnce([{ group: 'Daržovės', order: 0, annual: true, review: false }]);

        const response = await request(app).get('/api/v1/groups');

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({ groups: [{ group: 'Daržovės', order: 0, annual: true, review: false }] });
        expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
    });

    it('returns a configured client ID', async () => {
        const response = await request(app).get('/api/v1/auth/client-id');

        expect(response.status).toBe(200);
        expect(response.body.clientId).toEqual(expect.any(String));
    });

    it('updates and reorders groups through their collection routes', async () => {
        vi.mocked(updateGroup).mockResolvedValueOnce(true);
        vi.mocked(reorderGroups).mockResolvedValueOnce(true);

        const updated = await request(app).put('/api/v1/groups/Dar%C5%BEov%C4%97s').send({ review: true });
        const reordered = await request(app)
            .put('/api/v1/groups/order')
            .send({ groups: { Daržovės: 0 } });

        expect(updated.status).toBe(204);
        expect(reordered.status).toBe(204);
        expect(updateGroup).toHaveBeenCalledWith('Daržovės', true, true, undefined);
        expect(reorderGroups).toHaveBeenCalledWith({ Daržovės: 0 });
    });

    it('renames and deletes a group', async () => {
        vi.mocked(getGroups).mockResolvedValueOnce([{ group: 'Daržovės', order: 0, annual: true, review: false }]);
        vi.mocked(renameGroupOccurrences).mockResolvedValueOnce(true);
        vi.mocked(deleteGroupOccurrences).mockResolvedValueOnce(true);

        const renamed = await request(app).patch('/api/v1/groups/Dar%C5%BEov%C4%97s').send({ name: 'Daržai' });
        const deleted = await request(app).delete('/api/v1/groups/Dar%C5%BEov%C4%97s');

        expect(renamed.status).toBe(204);
        expect(deleted.status).toBe(204);
        expect(renameGroupOccurrences).toHaveBeenCalledWith('Daržovės', 'Daržai', true, false, undefined);
        expect(deleteGroupOccurrences).toHaveBeenCalledWith('Daržovės');
    });

    it('keeps the products response separate from legacy handlers', async () => {
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ products: [], years: [26] });

        const response = await request(app).get('/api/v1/products');

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({ products: [], years: [26] });
    });

    it('creates, modifies, and deletes products', async () => {
        vi.mocked(addProduct).mockResolvedValueOnce(true);
        vi.mocked(renameProduct).mockResolvedValueOnce(true);
        vi.mocked(moveProductOccurrences).mockResolvedValueOnce(true);
        vi.mocked(setProductParent).mockResolvedValueOnce(true);
        vi.mocked(setProductExpiryTolerance).mockResolvedValueOnce(true);
        vi.mocked(setMissing).mockResolvedValueOnce(true);
        vi.mocked(deleteProduct).mockResolvedValueOnce(true);

        const created = await request(app).post('/api/v1/products').send({ group: 'Daržovės', name: 'Agurkai' });
        const renamed = await request(app)
            .patch('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai')
            .send({ name: 'Pomidorai' });
        const moved = await request(app)
            .patch('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai')
            .send({ group: 'Vaisiai', newName: 'Obuoliai' });
        const parent = await request(app)
            .patch('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai')
            .send({ parent: null });
        const tolerance = await request(app)
            .patch('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai')
            .send({ expiryToleranceDays: 5 });
        const missing = await request(app)
            .patch('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai')
            .send({ missing: true });
        const deleted = await request(app).delete('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai');

        expect([
            created.status,
            renamed.status,
            moved.status,
            parent.status,
            tolerance.status,
            missing.status,
            deleted.status,
        ]).toStrictEqual([201, 204, 204, 204, 204, 204, 204]);
        expect([
            vi.mocked(addProduct).mock.calls,
            vi.mocked(renameProduct).mock.calls,
            vi.mocked(moveProductOccurrences).mock.calls,
            vi.mocked(setProductParent).mock.calls,
            vi.mocked(setProductExpiryTolerance).mock.calls,
            vi.mocked(setMissing).mock.calls,
            vi.mocked(deleteProduct).mock.calls,
        ]).toStrictEqual([
            [['Daržovės', 'Agurkai', undefined]],
            [['Daržovės', 'Agurkai', 'Pomidorai']],
            [['Daržovės', 'Agurkai', 'Vaisiai', 'Obuoliai']],
            [['Daržovės', 'Agurkai', undefined]],
            [['Daržovės', 'Agurkai', 5]],
            [['Daržovės', 'Agurkai', true]],
            [['Daržovės', 'Agurkai']],
        ]);
    });

    it('updates product images, amounts, and yearly removal state', async () => {
        vi.mocked(setImage).mockResolvedValueOnce(true);
        vi.mocked(setVariantImage).mockResolvedValueOnce(true);
        vi.mocked(setAmounts).mockResolvedValueOnce(true);
        vi.mocked(setRemoving).mockResolvedValueOnce(true);

        const image = await request(app)
            .put('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/image')
            .send({ image: 'image-id' });
        const variantImage = await request(app)
            .put('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/variants/l/image')
            .send({ image: 'variant-image' });
        const amounts = await request(app)
            .put('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/years/26/amounts')
            .send({ amounts: [{ variant: 'l', amount: 2 }], user: 'user' });
        const removing = await request(app)
            .patch('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/years/26')
            .send({ removing: true });

        expect(image.status).toBe(204);
        expect(variantImage.status).toBe(204);
        expect(amounts.status).toBe(204);
        expect(removing.status).toBe(204);
        expect(setImage).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'image-id');
        expect(setVariantImage).toHaveBeenCalledWith('Daržovės', 'Agurkai', 'l', 'variant-image');
        expect(setAmounts).toHaveBeenCalledWith(
            'Daržovės',
            'Agurkai',
            26,
            [{ variant: 'l', amount: 2 }],
            'user',
            undefined
        );
        expect(setRemoving).toHaveBeenCalledWith('Daržovės', 'Agurkai', 26, true);
    });

    it('takes product history identity from the path', async () => {
        vi.mocked(getProductUpdates).mockResolvedValueOnce([]);
        vi.mocked(getProductUndates).mockResolvedValueOnce([]);

        const response = await request(app).get('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/years/26/history');

        expect(response.status).toBe(200);
        expect(getProductUpdates).toHaveBeenCalledWith('Daržovės', 'Agurkai', 26);
        expect(getProductUndates).toHaveBeenCalledWith('Daržovės', 'Agurkai', 26);
    });

    it('takes summary history identity from the path', async () => {
        vi.mocked(getSummaryUpdates).mockResolvedValueOnce([]);
        vi.mocked(getSummaryUndates).mockResolvedValueOnce([]);

        const response = await request(app).get(
            '/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/years/26/summary-history'
        );

        expect(response.status).toBe(200);
        expect(getSummaryUpdates).toHaveBeenCalledWith('Daržovės', 'Agurkai', 26);
        expect(getSummaryUndates).toHaveBeenCalledWith('Daržovės', 'Agurkai', 26);
    });

    it('lists, modifies, copies, reorders, and deletes variants', async () => {
        const variant = { group: 'Daržovės', variant: 'l', order: 0, suffix: '', count: 1, units: 'vnt' } as any;
        vi.mocked(getVariants).mockResolvedValueOnce([variant]).mockResolvedValueOnce([variant]);
        vi.mocked(updateVariant).mockResolvedValueOnce(true);
        vi.mocked(copyVariant).mockResolvedValueOnce(true);
        vi.mocked(reorderVariants).mockResolvedValueOnce(true);
        vi.mocked(deleteVariant).mockResolvedValueOnce(true);

        const listed = await request(app).get('/api/v1/variants?group=Dar%C5%BEov%C4%97s');
        const updated = await request(app).patch('/api/v1/groups/Dar%C5%BEov%C4%97s/variants/l').send({ count: 2 });
        const copied = await request(app)
            .post('/api/v1/groups/Dar%C5%BEov%C4%97s/variants/l/copies')
            .send({ newGroup: 'Vaisiai' });
        const reordered = await request(app)
            .put('/api/v1/groups/Dar%C5%BEov%C4%97s/variants/order')
            .send({ variants: { l: 0 } });
        const deleted = await request(app).delete('/api/v1/groups/Dar%C5%BEov%C4%97s/variants/l');

        expect(listed.body.variants).toStrictEqual([variant]);
        expect(updated.status).toBe(204);
        expect(copied.status).toBe(204);
        expect(reordered.status).toBe(204);
        expect(deleted.status).toBe(204);
        expect(updateVariant).toHaveBeenCalledWith('Daržovės', 'l', {
            order: 0,
            suffix: '',
            count: 2,
            units: 'vnt',
        });
        expect(copyVariant).toHaveBeenCalledWith('Daržovės', 'l', 'Vaisiai', undefined, expect.any(Object));
        expect(reorderVariants).toHaveBeenCalledWith('Daržovės', { l: 0 });
        expect(deleteVariant).toHaveBeenCalledWith('Daržovės', 'l');
    });

    it('validates a profile replacement before writing it', async () => {
        const invalid = await request(app).put('/api/v1/user-profiles/user%40example.com').send({ name: 1 });

        expect(invalid.status).toBe(400);
        expect(invalid.body.error.code).toBe('VALIDATION_ERROR');
        expect(upsertUserProfile).not.toHaveBeenCalled();

        vi.mocked(upsertUserProfile).mockResolvedValueOnce(true);
        const valid = await request(app).put('/api/v1/user-profiles/user%40example.com').send({ name: 'User' });

        expect(valid.status).toBe(204);
        expect(upsertUserProfile).toHaveBeenCalledWith('user@example.com', 'User', undefined);
    });

    it('accepts repeated email query parameters for profiles', async () => {
        vi.mocked(getUserProfiles).mockResolvedValueOnce([]);

        const response = await request(app).get('/api/v1/user-profiles?email=a%40example.com&email=b%40example.com');

        expect(response.status).toBe(200);
        expect(getUserProfiles).toHaveBeenCalledWith(['a@example.com', 'b@example.com']);
    });

    it('returns the full summary and validates access requests', async () => {
        const { getFullSummary } = await import('~/server/data/summary');
        vi.mocked(getFullSummary).mockResolvedValueOnce({ groups: [] } as any);

        const summary = await request(app).get('/api/v1/summary');
        const invalidAccess = await request(app).get('/api/v1/access');

        expect(summary.status).toBe(200);
        expect(summary.body).toStrictEqual({ groups: [] });
        expect(invalidAccess.status).toBe(400);
    });

    it('updates review statuses across groups in one request', async () => {
        vi.mocked(setMissingBulk).mockResolvedValueOnce(true);

        const response = await request(app)
            .patch('/api/v1/products/review-statuses')
            .send({
                updates: [
                    { group: 'Daržovės', name: 'Agurkai', missing: true },
                    { group: 'Vaisiai', name: 'Obuoliai', missing: false },
                ],
            });

        expect(response.status).toBe(204);
        expect(setMissingBulk).toHaveBeenCalledWith([
            { group: 'Daržovės', name: 'Agurkai', missing: true },
            { group: 'Vaisiai', name: 'Obuoliai', missing: false },
        ]);
    });

    it('creates a recycled amount entry within the product year history', async () => {
        vi.mocked(moveConsumedToRecycled).mockResolvedValueOnce(true);

        const response = await request(app)
            .post('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/years/26/amount-history')
            .send({ variant: 'l', amount: 2, home: true });

        expect(response.status).toBe(204);
        expect(moveConsumedToRecycled).toHaveBeenCalledWith(
            'Daržovės',
            'Agurkai',
            26,
            'l',
            2,
            { suspicious: undefined, home: true, expiresAt: undefined },
            undefined
        );
    });

    it('undoes and redoes a product amount history entry', async () => {
        vi.mocked(undoProduct).mockResolvedValueOnce(true);
        vi.mocked(redoProduct).mockResolvedValueOnce(true);

        const undone = await request(app).post(
            '/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/years/26/amount-history/undo'
        );
        const redone = await request(app).post(
            '/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/years/26/amount-history/redo'
        );

        expect(undone.status).toBe(204);
        expect(redone.status).toBe(204);
        expect(undoProduct).toHaveBeenCalledWith('Daržovės', 'Agurkai', 26);
        expect(redoProduct).toHaveBeenCalledWith('Daržovės', 'Agurkai', 26);
    });

    it('sends an export archive from a GET resource', async () => {
        vi.mocked(buildExportArchive).mockResolvedValueOnce(Buffer.from('zip'));

        const response = await request(app).get('/api/v1/exports/latest');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/^application\/zip/);
        expect(response.headers['content-disposition']).toMatch(/attachment/);
        expect(buildExportArchive).toHaveBeenCalledOnce();
    });

    it('rejects imports without exactly one file', async () => {
        const response = await request(app).post('/api/v1/imports');

        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('imports an archive uploaded as multipart data', async () => {
        const archive = { data: { products: [], variants: [], groups: [] }, images: [] } as any;
        vi.mocked(readImportArchive).mockResolvedValueOnce(archive);
        vi.mocked(getValidator).mockReturnValueOnce((() => true) as any);
        vi.mocked(writeImportImages).mockResolvedValueOnce();
        vi.mocked(importEverything).mockResolvedValueOnce(true);
        const uploadApp = express().use(fileUpload()).use('/api/v1', createV1Router());

        const response = await request(uploadApp)
            .post('/api/v1/imports')
            .attach('import', Buffer.from('archive'), 'backup.zip');

        expect(response.status).toBe(204);
        expect(readImportArchive).toHaveBeenCalledWith(expect.any(Buffer));
        expect(writeImportImages).toHaveBeenCalledWith([]);
        expect(importEverything).toHaveBeenCalledWith([], [], []);
    });

    it('rejects invalid bulk and resource updates', async () => {
        const responses = await Promise.all([
            request(app).post('/api/v1/products').send({}),
            request(app).patch('/api/v1/groups/Dar%C5%BEov%C4%97s').send({ annual: 'yes' }),
            request(app).put('/api/v1/groups/Dar%C5%BEov%C4%97s').send({ review: 'yes' }),
            request(app).put('/api/v1/groups/order').send({}),
            request(app).patch('/api/v1/groups/Dar%C5%BEov%C4%97s/variants/l').send({ units: 'invalid' }),
            request(app).post('/api/v1/groups/Dar%C5%BEov%C4%97s/variants/l/copies').send({}),
            request(app).put('/api/v1/groups/Dar%C5%BEov%C4%97s/variants/order').send({}),
            request(app).patch('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai').send({}),
            request(app).put('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/image').send({}),
            request(app).put('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/variants/l/image').send({}),
            request(app).put('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/years/26/amounts').send({}),
            request(app).patch('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/years/26').send({}),
            request(app).post('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/years/26/amount-history').send({}),
            request(app)
                .patch('/api/v1/products/review-statuses')
                .send({ updates: [{ group: 'Daržovės', name: 'Agurkai' }] }),
        ]);

        expect(responses.map((response) => response.status)).toStrictEqual(Array<number>(14).fill(400));
    });

    it('returns operation rejection when a mutation cannot be applied', async () => {
        vi.mocked(updateGroup).mockResolvedValueOnce(false);
        vi.mocked(addProduct).mockResolvedValueOnce(false);
        vi.mocked(getVariants).mockResolvedValueOnce([
            { group: 'Daržovės', variant: 'l', order: 0, suffix: '', count: 1, units: 'vnt' } as any,
        ]);
        vi.mocked(updateVariant).mockResolvedValueOnce(false);

        const group = await request(app).put('/api/v1/groups/Dar%C5%BEov%C4%97s').send({});
        const product = await request(app).post('/api/v1/products').send({ group: 'Daržovės', name: 'Agurkai' });
        const variant = await request(app).patch('/api/v1/groups/Dar%C5%BEov%C4%97s/variants/l').send({ count: 2 });

        expect([group.status, product.status, variant.status]).toStrictEqual([422, 409, 422]);
    });
});
