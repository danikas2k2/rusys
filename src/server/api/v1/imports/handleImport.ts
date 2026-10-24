import { SchemaError, serializedArchiveDataSchema } from '~/schema';
import type { ApiRequest, ApiResponse, ApiUploadedFile } from '~/server/api/next';
import { sendError } from '~/server/api/v1/utils';
import { importEverything } from '~/server/data/common';
import { readImportArchive, writeImportImages } from '~/server/data/exportArchive';

async function importArchive(file: ApiUploadedFile): Promise<boolean> {
    const archive = await readImportArchive(file.data);
    const data = serializedArchiveDataSchema.parse(archive.data);
    await writeImportImages(archive.images);
    return importEverything(data.products, data.variants, data.groups);
}

export async function handleImport(req: ApiRequest, res: ApiResponse): Promise<void> {
    const received = req.files?.import;
    if (!received || Array.isArray(received)) {
        sendError(res, 400, 'VALIDATION_ERROR', SchemaError.ImportFileRequired);
        return;
    }
    try {
        if (!(await importArchive(received))) {
            sendError(res, 422, 'OPERATION_REJECTED', SchemaError.ArchiveCouldNotBeImported);
            return;
        }
        res.status(204).end();
    } catch {
        sendError(res, 400, 'INVALID_IMPORT', SchemaError.ImportInvalidContent);
    }
}
