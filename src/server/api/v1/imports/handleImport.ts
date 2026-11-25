import { MongoServerError } from 'mongodb';

import { MAX_IMPORT_FILE_SIZE } from '~/common/utils/files';
import { SchemaError, serializedArchiveDataSchema } from '~/schema';
import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { sendError } from '~/server/api/v1/utils';
import { importEverything, prepareImportImages, readImportArchive, writeImportImages } from '~/server/data/import';

export async function handleImport(req: ApiRequest, res: ApiResponse): Promise<void> {
    const received = req.files?.import;
    if (!received || Array.isArray(received)) {
        sendError(res, 400, 'VALIDATION_ERROR', SchemaError.ImportFileRequired);
        return;
    }
    if (received.data.length > MAX_IMPORT_FILE_SIZE) {
        sendError(res, 413, 'IMPORT_TOO_LARGE', SchemaError.InvalidZipFile);
        return;
    }
    const archive = await readImportArchive(received.data).catch(() => undefined);
    const data = serializedArchiveDataSchema.safeParse(archive?.data);
    if (!archive || !data.success) {
        sendError(res, 400, 'INVALID_IMPORT', SchemaError.ImportInvalidContent);
        return;
    }
    try {
        const prepared = prepareImportImages(data.data, archive.images);
        await importEverything(prepared.data, () => writeImportImages(prepared.images));
        res.status(204).end();
    } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
            sendError(res, 422, 'OPERATION_REJECTED', SchemaError.ArchiveCouldNotBeImported);
            return;
        }
        sendError(res, 500, 'INTERNAL_ERROR', SchemaError.ArchiveCouldNotBeImported);
    }
}
