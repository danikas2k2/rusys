// @vitest-environment node
import { mockRequest } from '@tests/mockRequest';
import { mockResponse } from '@tests/mockResponse';

import { handleExport } from '~/server/api/handleExport';
import { buildExportArchive } from '~/server/data/exportArchive';

vi.mock(import('~/server/api/debug'));
vi.mock(import('~/server/data/exportArchive'));

describe('handleExport', () => {
    beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));

    afterEach(() => vi.clearAllMocks());

    it('sends the archive as a zip attachment', async () => {
        const archive = Buffer.from('zip-bytes');
        vi.mocked(buildExportArchive).mockResolvedValueOnce(archive);

        const request = mockRequest();
        const response = mockResponse();

        vi.useFakeTimers().setSystemTime(Date.parse('2026-07-31T12:00:00.000Z'));
        await handleExport(request, response);
        vi.useRealTimers();

        expect(response.header).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/zip');
        expect(response.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="2026-07-31.zip"');
        expect(response.send).toHaveBeenCalledWith(archive);
    });

    it('returns a JSON error response when building the archive fails', async () => {
        vi.mocked(buildExportArchive).mockRejectedValueOnce(new Error('Failed to export'));

        const request = mockRequest();
        const response = mockResponse();

        await handleExport(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({ ok: false, error: 'Error: Failed to export' });
        expect(response.send).not.toHaveBeenCalled();
    });
});
