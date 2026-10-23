// @vitest-environment node
import { SchemaError } from '~/schema';
import { setVariantImageAction } from '~/server/actions/products';
import type { ApiRequest } from '~/server/api/next';
import { handlePutProductVariantImage } from '~/server/api/v1/products/handlePutProductVariantImage';
import { mockResponse } from '~/server/data/tests/handleResponse';

vi.mock(import('~/server/actions/products'));

describe('handlePutProductVariantImage', () => {
    const params = { group: 'Food', name: 'Apple', variant: 'Box' };
    const request = (body: unknown, routeParams = params): ApiRequest => ({ body, params: routeParams, query: {} });

    beforeEach(() => {
        vi.mocked(setVariantImageAction).mockReset();
    });

    it('forwards the validated image and route identity to the action', async () => {
        const response = mockResponse();

        await handlePutProductVariantImage(
            request({ image: 'photo.webp', group: 'Other', name: 'Injected', variant: 'Bad' }),
            response
        );

        expect(setVariantImageAction).toHaveBeenCalledExactlyOnceWith({ ...params, image: 'photo.webp' });
        expect(response.status).toHaveBeenCalledExactlyOnceWith(204);
        expect(response.end).toHaveBeenCalledExactlyOnceWith();
        expect(response.json).not.toHaveBeenCalled();
    });

    it.each([
        [request({}), 'missing image'],
        [request({ image: 42 }), 'non-string image'],
        [request({ image: 'photo.webp' }, { ...params, variant: '' }), 'empty route variant'],
    ])('rejects invalid input (%s)', async (invalidRequest) => {
        const response = mockResponse();

        await handlePutProductVariantImage(invalidRequest, response);

        expect(setVariantImageAction).not.toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledExactlyOnceWith(400);
        expect(response.json).toHaveBeenCalledExactlyOnceWith({
            error: { code: 'VALIDATION_ERROR', message: SchemaError.InvalidRequest },
        });
        expect(response.end).not.toHaveBeenCalled();
    });

    it.each([
        [new Error(SchemaError.InvalidRequest), 400, 'VALIDATION_ERROR', SchemaError.InvalidRequest],
        [new Error(SchemaError.RequestFailed), 422, 'OPERATION_REJECTED', SchemaError.RequestFailed],
        [new Error(SchemaError.Unauthorized), 401, 'UNAUTHORIZED', SchemaError.Unauthorized],
        [new Error('Sensitive database details'), 500, 'INTERNAL_ERROR', SchemaError.RequestFailed],
        ['Sensitive backend rejection', 500, 'INTERNAL_ERROR', SchemaError.RequestFailed],
    ])('maps an action failure to a safe response (%s)', async (cause, status, code, message) => {
        vi.mocked(setVariantImageAction).mockRejectedValueOnce(cause);
        const response = mockResponse();

        await handlePutProductVariantImage(request({ image: 'photo.webp' }), response);

        expect(response.status).toHaveBeenCalledExactlyOnceWith(status);
        expect(response.json).toHaveBeenCalledExactlyOnceWith({ error: { code, message } });
        expect(response.end).not.toHaveBeenCalled();
    });
});
