import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { sendError } from '~/server/api/v1/utils';
import { buildExportArchive } from '~/server/data/exportArchive';

export async function handleExportLatest(req: ApiRequest, res: ApiResponse): Promise<void> {
    try {
        const archive = await buildExportArchive();
        const filename = `${new Date().toISOString().slice(0, 10)}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(archive);
    } catch (error) {
        sendError(res, 500, 'INTERNAL_ERROR', `${error}`);
    }
}
