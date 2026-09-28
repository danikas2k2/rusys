import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePatchProduct } from '~/server/api/v1/products/handlePatchProduct';
import { moveProductOccurrences } from '~/server/data/common';
import { renameProduct, setMissing, setProductExpiryTolerance, setProductParent } from '~/server/data/products';

vi.mock(import('~/server/data/common'), () => ({ moveProductOccurrences: vi.fn() }));
vi.mock(import('~/server/data/products'), () => ({
    renameProduct: vi.fn(),
    setMissing: vi.fn(),
    setProductExpiryTolerance: vi.fn(),
    setProductParent: vi.fn(),
}));

const params = { group: 'Uogienės', name: 'Avietės' };

async function patch(body: unknown, routeParams = params) {
    const request = new NextRequest('http://localhost/api/v1/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return runApiHandler(request, handlePatchProduct, routeParams);
}

describe('handlePatchProduct', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        for (const action of [
            renameProduct,
            moveProductOccurrences,
            setProductParent,
            setProductExpiryTolerance,
            setMissing,
        ]) {
            vi.mocked(action).mockResolvedValue(true);
        }
    });

    it('requires route parameters and exactly one changed field', async () => {
        expect((await patch({ name: 'Džemas' }, { group: '', name: 'Avietės' })).status).toBe(400);
        expect((await patch({})).status).toBe(400);
        expect((await patch({ name: 'Džemas', missing: true })).status).toBe(400);
        expect(renameProduct).not.toHaveBeenCalled();
    });

    it.each([
        { body: { name: 123 }, field: 'name' },
        { body: { group: 'Daržovės', newName: 123 }, field: 'group' },
        { body: { parent: 123 }, field: 'parent' },
        { body: { expiryToleranceDays: -1 }, field: 'expiryToleranceDays' },
        { body: { expiryToleranceDays: 1.5 }, field: 'expiryToleranceDays' },
        { body: { missing: 'yes' }, field: 'missing' },
    ])('rejects an invalid $field value', async ({ body }) => {
        const response = await patch(body);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    });

    it('dispatches identity and category changes', async () => {
        expect((await patch({ name: 'Džemas' })).status).toBe(204);
        expect(renameProduct).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Džemas');

        expect((await patch({ group: 'Daržovės', newName: 'Džemas' })).status).toBe(204);
        expect(moveProductOccurrences).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Daržovės', 'Džemas');
    });

    it('dispatches parent, expiry and missing-status changes', async () => {
        expect((await patch({ parent: null })).status).toBe(204);
        expect(setProductParent).toHaveBeenCalledWith('Uogienės', 'Avietės', undefined);

        expect((await patch({ expiryToleranceDays: 7 })).status).toBe(204);
        expect(setProductExpiryTolerance).toHaveBeenCalledWith('Uogienės', 'Avietės', 7);

        expect((await patch({ missing: true })).status).toBe(204);
        expect(setMissing).toHaveBeenCalledWith('Uogienės', 'Avietės', true);
    });

    it('returns rejected and unexpected operation errors without a false success', async () => {
        vi.mocked(renameProduct).mockResolvedValueOnce(false);
        const rejected = await patch({ name: 'Džemas' });

        expect(rejected.status).toBe(422);
        await expect(rejected.json()).resolves.toMatchObject({ error: { code: 'OPERATION_REJECTED' } });

        vi.mocked(renameProduct).mockRejectedValueOnce(new Error('database unavailable'));
        const failed = await patch({ name: 'Džemas' });

        expect(failed.status).toBe(500);
        await expect(failed.json()).resolves.toMatchObject({ error: { code: 'INTERNAL_ERROR' } });
    });
});
