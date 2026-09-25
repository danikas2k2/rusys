// @vitest-environment node
import { handleAuthClientId } from '~/server/api/v1/auth/handleAuthClientId';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleAuthClientId', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handleAuthClientId({} as any, response as any);

        expect(response.json).toHaveBeenCalledWith({ clientId: expect.any(String) });
    });
});
