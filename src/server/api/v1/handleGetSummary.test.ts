// @vitest-environment node
import { getFullSummary } from '~/server/data/summary';

vi.mock(import('~/server/data/summary'));

import { handleGetSummary } from '~/server/api/v1/handleGetSummary';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleGetSummary', () => {
    it('handles its request', async () => {
        const response = mockResponse();
        vi.mocked(getFullSummary).mockResolvedValueOnce({ groups: [] } as any);

        await handleGetSummary({} as any, response as any);

        expect(response.json).toHaveBeenCalledWith({ groups: [] });
    });
});
