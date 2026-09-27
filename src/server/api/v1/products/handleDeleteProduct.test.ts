import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleDeleteProduct } from '~/server/api/v1/products/handleDeleteProduct';
import { deleteProduct } from '~/server/data/products';

vi.mock(import('~/server/data/products'), () => ({ deleteProduct: vi.fn() }));

async function remove(name = 'Avietės') {
    const request = new NextRequest('http://localhost/api/v1/products', { method: 'DELETE' });
    return runApiHandler(request, handleDeleteProduct, { group: 'Uogienės', name });
}

describe('handleDeleteProduct', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(deleteProduct).mockResolvedValue(true);
    });

    it('requires a product name', async () => {
        expect((await remove('')).status).toBe(400);
        expect(deleteProduct).not.toHaveBeenCalled();
    });

    it('archives the selected product', async () => {
        expect((await remove()).status).toBe(204);
        expect(deleteProduct).toHaveBeenCalledWith('Uogienės', 'Avietės');
    });

    it('reports a product that could not be archived', async () => {
        vi.mocked(deleteProduct).mockResolvedValueOnce(false);

        expect((await remove()).status).toBe(422);
    });
});
