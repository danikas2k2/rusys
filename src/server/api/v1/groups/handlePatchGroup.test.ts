import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePatchGroup } from '~/server/api/v1/groups/handlePatchGroup';
import { renameGroupOccurrences } from '~/server/data/common';
import { getGroups, updateGroup } from '~/server/data/groups';

vi.mock(import('~/server/data/common'), () => ({ renameGroupOccurrences: vi.fn() }));
vi.mock(import('~/server/data/groups'), () => ({ getGroups: vi.fn(), updateGroup: vi.fn() }));

async function patch(body: unknown, group = 'Uogienės') {
    const request = new NextRequest('http://localhost/api/v1/groups/Uogienės', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return runApiHandler(request, handlePatchGroup, { group });
}

describe('handlePatchGroup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getGroups).mockResolvedValue([{ group: 'Uogienės', annual: true, review: false, image: 'old.png' }]);
        vi.mocked(updateGroup).mockResolvedValue(true);
        vi.mocked(renameGroupOccurrences).mockResolvedValue(true);
    });

    it('validates the path, payload and existence of the category', async () => {
        expect((await patch({ review: true }, '')).status).toBe(400);
        expect((await patch({ annual: 'yes' })).status).toBe(400);

        vi.mocked(getGroups).mockResolvedValueOnce([]);
        const missing = await patch({ review: true });

        expect(missing.status).toBe(404);
        expect(updateGroup).not.toHaveBeenCalled();
    });

    it('preserves unspecified fields when updating a category', async () => {
        const response = await patch({ review: true });

        expect(response.status).toBe(204);
        expect(updateGroup).toHaveBeenCalledWith('Uogienės', true, true, 'old.png');
    });

    it('renames a category with its updated options', async () => {
        const response = await patch({ name: 'Uogų uogienės', annual: false, image: 'new.png' });

        expect(response.status).toBe(204);
        expect(renameGroupOccurrences).toHaveBeenCalledWith('Uogienės', 'Uogų uogienės', false, false, 'new.png');
    });

    it('reports a rejected or failed change', async () => {
        vi.mocked(updateGroup).mockResolvedValueOnce(false);

        expect((await patch({ review: true })).status).toBe(422);

        vi.mocked(updateGroup).mockRejectedValueOnce(new Error('database unavailable'));

        expect((await patch({ review: true })).status).toBe(500);
    });
});
