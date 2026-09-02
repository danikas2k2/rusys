import type { Response } from 'express';

import type { ApiRequest } from '~/common/api';
import { debugRequest } from '~/server/api/debug';
import { headerNoCache } from '~/server/api/utils';
import { buildExportArchive } from '~/server/data/exportArchive';

export async function handleExport(req: ApiRequest, res: Response): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    try {
        const archive = await buildExportArchive();
        const filename = `${new Date().toISOString().slice(0, 10)}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(archive);
    } catch (e) {
        const { error } = console;
        error(e);
        res.status(500).json({ ok: false, error: `${e}` });
    }
}
