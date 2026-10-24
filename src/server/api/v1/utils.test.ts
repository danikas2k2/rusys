import { SchemaError } from '~/schema';
import type { ApiRequest } from '~/server/api/next';
import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('api responses', () => {
    it('sends the requested status and structured error', () => {
        const response = mockResponse();

        sendError(response, 409, 'CONFLICT', SchemaError.NameAlreadyExists);

        expect(response.status).toHaveBeenCalledExactlyOnceWith(409);
        expect(response.json).toHaveBeenCalledExactlyOnceWith({
            error: { code: 'CONFLICT', message: SchemaError.NameAlreadyExists },
        });
    });

    it('returns a present route parameter without sending a response', () => {
        const response = mockResponse();
        const request: ApiRequest = { body: {}, params: { group: 'Food' }, query: {} };

        expect(requiredParam(request, response, 'group')).toBe('Food');
        expect(response.status).not.toHaveBeenCalled();
    });

    it.each([
        ['group', undefined, SchemaError.GroupParamRequired],
        ['name', '', SchemaError.NameRequired],
        ['variant', 42, SchemaError.VariantRequired],
        ['email', ['a@example.com'], SchemaError.EmailRequired],
        ['unknown', undefined, SchemaError.InvalidRequest],
    ])('rejects a missing or malformed %s parameter', (name, value, message) => {
        const response = mockResponse();
        const request = { body: {}, params: { [name]: value }, query: {} } as unknown as ApiRequest;

        expect(requiredParam(request, response, name)).toBeUndefined();
        expect(response.status).toHaveBeenCalledExactlyOnceWith(400);
        expect(response.json).toHaveBeenCalledExactlyOnceWith({ error: { code: 'VALIDATION_ERROR', message } });
    });

    it('returns no content for a successful action without a body', async () => {
        const response = mockResponse();
        const action = vi.fn().mockResolvedValue(true);

        await respond(response, action);

        expect(action).toHaveBeenCalledExactlyOnceWith();
        expect(response.status).toHaveBeenCalledExactlyOnceWith(204);
        expect(response.json).toHaveBeenCalledExactlyOnceWith(undefined);
    });

    it('loads the response body only after a successful action', async () => {
        const response = mockResponse();
        const action = vi.fn().mockResolvedValue(true);
        const body = vi.fn(async () => {
            expect(action).toHaveBeenCalledExactlyOnceWith();

            return { updated: true };
        });

        await respond(response, action, body);

        expect(body).toHaveBeenCalledExactlyOnceWith();
        expect(response.status).toHaveBeenCalledExactlyOnceWith(200);
        expect(response.json).toHaveBeenCalledExactlyOnceWith({ updated: true });
    });

    it('rejects a failed action without reading its response body', async () => {
        const response = mockResponse();
        const body = vi.fn();

        await respond(response, vi.fn().mockResolvedValue(false), body);

        expect(body).not.toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledExactlyOnceWith(422);
        expect(response.json).toHaveBeenCalledExactlyOnceWith({
            error: { code: 'OPERATION_REJECTED', message: SchemaError.RequestFailed },
        });
    });

    it('hides unexpected action failures and skips reading the body', async () => {
        const response = mockResponse();
        const action = vi.fn().mockRejectedValue(new Error('Sensitive backend details'));
        const body = vi.fn();

        await respond(response, action, body);

        expect(body).not.toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledExactlyOnceWith(500);
        expect(response.json).toHaveBeenCalledExactlyOnceWith({
            error: { code: 'INTERNAL_ERROR', message: SchemaError.RequestFailed },
        });
    });

    it('hides unexpected response body failures', async () => {
        const response = mockResponse();
        const body = vi.fn().mockRejectedValue(new Error('Sensitive backend details'));

        await respond(response, vi.fn().mockResolvedValue(true), body);

        expect(body).toHaveBeenCalledExactlyOnceWith();
        expect(response.status).toHaveBeenLastCalledWith(500);
        expect(response.json).toHaveBeenCalledExactlyOnceWith({
            error: { code: 'INTERNAL_ERROR', message: SchemaError.RequestFailed },
        });
    });
});
