import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleCreateProduct } from '~/server/api/v1/products/handleCreateProduct';
import { addProduct } from '~/server/data/products';

vi.mock(import('~/server/data/products'), () => ({ addProduct: vi.fn() }));

async function create(body: unknown) {
    const request = new NextRequest('http://localhost/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return runApiHandler(request, handleCreateProduct);
}

describe('handleCreateProduct', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(addProduct).mockResolvedValue(true);
    });

    it('requires a category and product name', async () => {
        expect((await create({ group: 'Uogienės' })).status).toBe(400);
        expect(addProduct).not.toHaveBeenCalled();
    });

    it('creates a product and returns its encoded location', async () => {
        const response = await create({ group: 'Uogienės', name: 'Avietės', parent: 'Uogos' });

        expect(response.status).toBe(201);
        expect(response.headers.get('Location')).toBe('/api/v1/groups/Uogien%C4%97s/products/Aviet%C4%97s');
        expect(addProduct).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Uogos');
    });

    it('reports duplicate products and storage failures', async () => {
        vi.mocked(addProduct).mockResolvedValueOnce(false);

        expect((await create({ group: 'Uogienės', name: 'Avietės' })).status).toBe(409);

        vi.mocked(addProduct).mockRejectedValueOnce(new Error('database unavailable'));

        expect((await create({ group: 'Uogienės', name: 'Avietės' })).status).toBe(500);
    });
});
