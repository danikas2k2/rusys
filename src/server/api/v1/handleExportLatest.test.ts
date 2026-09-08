// @vitest-environment node
import { buildExportArchive } from '~/server/data/exportArchive';

vi.mock(import('~/server/data/exportArchive'));

import { handleExportLatest } from '~/server/api/v1/handleExportLatest';
import { mockResponse } from '~/server/data/tests/handleResponse';

describe('handleExportLatest', () => {
    it('handles its request', async () => {
        const response = mockResponse();
        vi.mocked(buildExportArchive).mockResolvedValueOnce(Buffer.from('zip'));

        await handleExportLatest({} as any, response as any);

        expect(response.send).toHaveBeenCalledWith(Buffer.from('zip'));
    });
});
