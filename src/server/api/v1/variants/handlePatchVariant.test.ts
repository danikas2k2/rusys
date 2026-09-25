// @vitest-environment node
import { handlePatchVariant } from '~/server/api/v1/variants/handlePatchVariant';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePatchVariant', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePatchVariant({ params: {}, body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
