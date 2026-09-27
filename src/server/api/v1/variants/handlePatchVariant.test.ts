import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePatchVariant } from '~/server/api/v1/variants/handlePatchVariant';
import { renameVariantOccurrences } from '~/server/data/common';
import { getVariants, updateVariant } from '~/server/data/variants';

vi.mock(import('~/server/data/common'), () => ({ renameVariantOccurrences: vi.fn() }));
vi.mock(import('~/server/data/variants'), () => ({ getVariants: vi.fn(), updateVariant: vi.fn() }));

async function patch(body: unknown, variant = 'Stiklainis') {
    const request = new NextRequest('http://localhost/api/v1/variants/Stiklainis', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return runApiHandler(request, handlePatchVariant, { group: 'Uogienės', variant });
}

describe('handlePatchVariant', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getVariants).mockResolvedValue([
            { group: 'Uogienės', variant: 'Stiklainis', order: 1, count: 2, suffix: 'pak.', units: 'vnt' },
        ]);
        vi.mocked(updateVariant).mockResolvedValue(true);
        vi.mocked(renameVariantOccurrences).mockResolvedValue(true);
    });

    it('rejects missing route parameters and malformed fields', async () => {
        expect((await patch({ count: 3 }, '')).status).toBe(400);
        expect((await patch({ units: 'boxes' })).status).toBe(400);
        expect((await patch({ count: '3' })).status).toBe(400);
        expect(updateVariant).not.toHaveBeenCalled();
    });

    it('returns not found when attempting to rename a missing variant', async () => {
        vi.mocked(getVariants).mockResolvedValueOnce([]);

        expect((await patch({ name: 'Indelis' })).status).toBe(404);
        expect(renameVariantOccurrences).not.toHaveBeenCalled();
    });

    it('updates metadata while retaining omitted values', async () => {
        const response = await patch({ count: 4, units: 'kg' });

        expect(response.status).toBe(204);
        expect(updateVariant).toHaveBeenCalledWith('Uogienės', 'Stiklainis', {
            order: 1,
            suffix: 'pak.',
            count: 4,
            units: 'kg',
        });
    });

    it('renames the variant and its occurrences', async () => {
        expect((await patch({ name: 'Indelis', suffix: 'vnt.' })).status).toBe(204);
        expect(renameVariantOccurrences).toHaveBeenCalledWith('Uogienės', 'Stiklainis', 'Indelis', {
            order: 1,
            suffix: 'vnt.',
            count: 2,
            units: 'vnt',
        });
    });

    it('reports conflicts, rejected updates and unexpected failures', async () => {
        vi.mocked(renameVariantOccurrences).mockResolvedValueOnce(false);

        expect((await patch({ name: 'Indelis' })).status).toBe(409);

        vi.mocked(updateVariant).mockResolvedValueOnce(false);

        expect((await patch({ count: 4 })).status).toBe(422);

        vi.mocked(updateVariant).mockRejectedValueOnce(new Error('database unavailable'));

        expect((await patch({ count: 4 })).status).toBe(500);
    });
});
