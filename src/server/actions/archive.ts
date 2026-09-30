'use server';

import { Buffer } from 'node:buffer';

import { MAX_IMPORT_FILE_SIZE } from '~/common/utils/files';
import { runServerHandler } from '~/server/api/next';
import { handleImport } from '~/server/api/v1/imports/handleImport';
import { requireSession } from '~/server/auth/session';
import { buildExportArchive } from '~/server/data/exportArchive';

export async function importArchive(data: FormData): Promise<string | undefined> {
    await requireSession();
    if (!(data instanceof FormData)) {
        return 'Choose a valid ZIP file';
    }
    const file = data.get('import');
    if (!(file instanceof File) || file.size > MAX_IMPORT_FILE_SIZE) {
        return 'Choose a valid ZIP file';
    }
    const response = await runServerHandler(handleImport, {
        body: {},
        files: { import: { data: Buffer.from(await file.arrayBuffer()) } },
        params: {},
        query: {},
    });
    if (!response.ok) {
        const failure = (await response.json()) as { error?: { message?: string } };
        return failure.error?.message ?? `Import failed (${response.status})`;
    }
}

export async function exportArchive(): Promise<string> {
    await requireSession();
    return (await buildExportArchive()).toString('base64');
}
