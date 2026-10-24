import { NextRequest } from 'next/server';

import { SchemaError } from '~/schema';
import { setProductImageAction, setVariantImageAction } from '~/server/actions/products';
import { runApiHandler, type ApiHandler } from '~/server/api/next';
import { handlePutProductImage } from '~/server/api/v1/products/handlePutProductImage';
import { handlePutProductVariantImage } from '~/server/api/v1/products/handlePutProductVariantImage';

vi.mock(import('~/server/actions/products'));

const productParams = { group: 'Uogienės', name: 'Avietės' };

async function call(handler: ApiHandler, method: string, params: Record<string, string>, body: unknown) {
    const request = new NextRequest('http://localhost/api/v1/test', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return runApiHandler(request, handler, params);
}

describe('image API route contracts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('sets product and variant images, including an explicit removal', async () => {
        vi.mocked(setProductImageAction).mockResolvedValue(undefined);
        vi.mocked(setVariantImageAction).mockResolvedValue(undefined);

        expect((await call(handlePutProductImage, 'PUT', productParams, { image: '' })).status).toBe(204);
        expect(setProductImageAction).toHaveBeenCalledWith({ ...productParams, image: '' });
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
        expect(setVariantImageAction).toHaveBeenCalledWith({
            ...productParams,
            variant: 'Stiklainis',
            image: '/images/icon.png',
        });
    });

    it('normalizes route identifiers and prevents body fields from overriding them', async () => {
        const response = await call(
            handlePutProductVariantImage,
            'PUT',
            { group: ' A ', name: ' P ', variant: ' v ' },
            { group: 'Other', name: 'Other', variant: 'Other', image: '' }
        );

        expect(response.status).toBe(204);
        expect(setVariantImageAction).toHaveBeenCalledExactlyOnceWith({
            group: 'A',
            name: 'P',
            variant: 'v',
            image: '',
        });
    });

    it.each([
        [handlePutProductImage, setProductImageAction, productParams],
        [handlePutProductVariantImage, setVariantImageAction, { ...productParams, variant: 'v' }],
    ] as const)('rejects malformed input without calling the action', async (handler, action, params) => {
        expect((await call(handler, 'PUT', params, null)).status).toBe(400);
        expect((await call(handler, 'PUT', { ...params, group: ' ' }, { image: '' })).status).toBe(400);
        expect(action).not.toHaveBeenCalled();
    });

    it.each([
        [SchemaError.Unauthorized, 401, SchemaError.Unauthorized],
        [SchemaError.InvalidRequest, 400, SchemaError.InvalidRequest],
        [SchemaError.RequestFailed, 422, SchemaError.RequestFailed],
        ['private database failure', 500, SchemaError.RequestFailed],
    ] as const)('maps action failures without exposing unexpected errors', async (message, status, expectedMessage) => {
        vi.mocked(setProductImageAction).mockRejectedValueOnce(new Error(message));
        const response = await call(handlePutProductImage, 'PUT', productParams, { image: '' });

        expect(response.status).toBe(status);

        await expect(response.json()).resolves.toMatchObject({ error: { message: expectedMessage } });
    });
});
