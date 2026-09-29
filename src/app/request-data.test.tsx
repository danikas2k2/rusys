import { API } from '~/common/api/v1';
import { requestData } from '~/server/actions/requestData';
import { runServerHandler } from '~/server/api/next';
import { handlePatchProduct } from '~/server/api/v1/products/handlePatchProduct';

vi.mock(import('~/server/api/next'));

describe('requestData', () => {
    afterEach(() => vi.clearAllMocks());

    it('runs a selected mutation in-process with decoded route parameters', async () => {
        vi.mocked(runServerHandler).mockResolvedValue(new Response(null, { status: 204 }));

        await expect(
            requestData('/api/v1/groups/Uogien%C4%97s/products/Aviet%C4%97s', 'PATCH', { name: 'Braškės' })
        ).resolves.toBeUndefined();

        expect(runServerHandler).toHaveBeenCalledWith(handlePatchProduct, {
            body: { name: 'Braškės' },
            params: { group: 'Uogienės', name: 'Avietės' },
            query: {},
        });
    });

    it('accepts a successful handler with an empty 200 response', async () => {
        vi.mocked(runServerHandler).mockResolvedValue(new Response(null, { status: 200 }));

        await expect(requestData(API.products(), 'POST', { name: 'Test' })).resolves.toBeUndefined();
    });

    it('rejects operations outside the allowlist', async () => {
        await expect(requestData('https://example.com/api/v1/products', 'POST')).rejects.toThrow(
            'Unsupported operation'
        );
        await expect(requestData('/api/v1/products', 'DELETE')).rejects.toThrow('Unsupported operation');
        expect(runServerHandler).not.toHaveBeenCalled();
    });

    it('covers the resource reads and mutation paths used by the client', async () => {
        vi.mocked(runServerHandler).mockResolvedValue(new Response(null, { status: 204 }));
        const group = 'A';
        const name = 'B';
        const variant = 'C';
        const year = 2026;
        const paths = [
            [API.products(), 'GET'],
            [API.groups(), 'GET'],
            [API.variants(), 'GET'],
            [API.summary(), 'GET'],
            [API.products(), 'POST'],
            [API.productReviewStatuses(), 'PATCH'],
            [API.groupOrder(), 'PUT'],
            [API.group(group), 'PUT'],
            [API.group(group), 'PATCH'],
            [API.group(group), 'DELETE'],
            [API.groupVariantOrder(group), 'PUT'],
            [API.groupVariant(group, variant), 'PATCH'],
            [API.groupVariant(group, variant), 'DELETE'],
            [API.groupVariantCopies(group, variant), 'POST'],
            [API.groupProduct(group, name), 'PATCH'],
            [API.groupProduct(group, name), 'DELETE'],
            [API.productImage(group, name), 'PUT'],
            [API.productVariantImage(group, name, variant), 'PUT'],
            [API.productYear(group, name, year), 'PATCH'],
            [API.productAmounts(group, name, year), 'PUT'],
            [API.productAmountTransfers(group, name, year), 'POST'],
            [API.productAmountHistory(group, name, year), 'POST'],
            [`${API.productAmountHistory(group, name, year)}/undo`, 'POST'],
            [`${API.productAmountHistory(group, name, year)}/redo`, 'POST'],
        ] as const;

        for (const [url, method] of paths) {
            await expect(requestData(url, method)).resolves.toBeUndefined();
        }

        expect(runServerHandler).toHaveBeenCalledTimes(paths.length);
    });

    it('preserves validation errors from the existing handler', async () => {
        vi.mocked(runServerHandler).mockResolvedValue(
            Response.json({ error: { message: 'Invalid product' } }, { status: 400 })
        );

        await expect(requestData('/api/v1/products', 'POST', {})).rejects.toThrow('Invalid product');
    });
});
