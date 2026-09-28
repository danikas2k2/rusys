// @vitest-environment node
import { handlePostVariantCopy } from '~/server/api/v1/variants/handlePostVariantCopy';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handlePostVariantCopy', () => {
    it('handles its request', async () => {
        const response = mockResponse();

        await handlePostVariantCopy({ params: {}, body: {} } as any, response as any);

        expect(response.status).toHaveBeenCalledWith(400);
    });
});
