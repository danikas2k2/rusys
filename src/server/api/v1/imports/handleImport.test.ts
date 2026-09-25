// @vitest-environment node
import { handleImport } from '~/server/api/v1/imports/handleImport';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleImport', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handleImport({ files: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
