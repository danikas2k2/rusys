// @vitest-environment node
import express from 'express';
import request from 'supertest';

import { getProductsWithYears } from '~/server/api/response';
import { createV1Router } from '~/server/api/v1/router';
import { buildExportArchive } from '~/server/data/exportArchive';
import { getGroups } from '~/server/data/groups';
import { getProductUndates, getProductUpdates, moveConsumedToRecycled, setMissingBulk } from '~/server/data/products';
import { getUserProfiles, upsertUserProfile } from '~/server/data/userProfiles';

vi.mock(import('~/server/api/response'));
vi.mock(import('~/server/data/groups'));
vi.mock(import('~/server/data/exportArchive'));
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

    it('keeps the products response separate from legacy handlers', async () => {
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ products: [], years: [26] });

        const response = await request(app).get('/api/v1/products');

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({ products: [], years: [26] });
    });

    it('takes product history identity from the path', async () => {
        vi.mocked(getProductUpdates).mockResolvedValueOnce([]);
        vi.mocked(getProductUndates).mockResolvedValueOnce([]);

        const response = await request(app).get('/api/v1/groups/Dar%C5%BEov%C4%97s/products/Agurkai/years/26/history');

        expect(response.status).toBe(200);
        expect(getProductUpdates).toHaveBeenCalledWith('Daržovės', 'Agurkai', 26);
        expect(getProductUndates).toHaveBeenCalledWith('Daržovės', 'Agurkai', 26);
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

    it('updates review status within the group named in the URL', async () => {
        vi.mocked(setMissingBulk).mockResolvedValueOnce(true);

        const response = await request(app)
            .patch('/api/v1/groups/Dar%C5%BEov%C4%97s/products/review-statuses')
            .send({ updates: [{ name: 'Agurkai', missing: true }] });

        expect(response.status).toBe(204);
        expect(setMissingBulk).toHaveBeenCalledWith([{ group: 'Daržovės', name: 'Agurkai', missing: true }]);
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
});
