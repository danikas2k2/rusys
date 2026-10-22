'use server';

import { Buffer } from 'node:buffer';

import * as schema from '~/schema';
import { runServerHandler } from '~/server/api/next';
import { handleImport } from '~/server/api/v1/imports/handleImport';
import { requireSession } from '~/server/auth/session';
import { exportEverything } from '~/server/data/common';
import { buildExportArchive } from '~/server/data/exportArchive';
import { withinTransaction } from '~/server/db';

export async function importArchive(data: schema.ImportArchive): Promise<string | undefined> {
    await requireSession();

    const { success, data: file } = schema.importArchive.safeParse(data);
    if (!success) {
        return schema.SchemaError.InvalidZipFile;
    }

    const response = await runServerHandler(handleImport, {
        body: {},
        files: { import: { data: Buffer.from(await file.arrayBuffer()) } },
        params: {},
        query: {},
    });

    if (!response.ok) {
        return schema.SchemaError.ImportFailed;
    }
}

export async function exportArchive(): Promise<string> {
    await requireSession();
    const data = await withinTransaction(exportEverything);
    return (await buildExportArchive(data)).toString('base64');
}
