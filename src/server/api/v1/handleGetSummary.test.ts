// @vitest-environment node
import { handleGetSummary } from '~/server/api/v1/handleGetSummary';
import { getFullSummary } from '~/server/data/summary';
import { mockResponse } from '~/server/data/tests/handleResponse';

vi.mock(import('~/server/data/summary'));

describe('handleGetSummary', () => {
    it('handles its request', async () => {
        const response = mockResponse();
        vi.mocked(getFullSummary).mockResolvedValueOnce({ groups: [] } as any);

        await handleGetSummary({} as any, response as any);

        expect(response.json).toHaveBeenCalledWith({ groups: [] });
    });
});
