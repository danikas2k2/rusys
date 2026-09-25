import type { Update } from '~/common/data';
import type { ApiRequest, ApiResponse, ApiUploadedFile } from '~/server/api/next';
import { sendError } from '~/server/api/v1/utils';
import { importEverything } from '~/server/data/common';
import { readImportArchive, writeImportImages } from '~/server/data/exportArchive';
import { getValidator } from '~/server/data/schema/getValidator';

async function importArchive(file: ApiUploadedFile): Promise<boolean> {
    const archive = await readImportArchive(file.data);
    const validate = getValidator();
    if (!validate(archive.data)) {
        throw new Error('Invalid file content');
    }
    await writeImportImages(archive.images);
    const { data } = archive;
    return importEverything(
        data.products.map((product) => ({
            ...product,
            updates: (product.updates as Update[] | undefined)?.map((update) => ({
                ...update,
                time: new Date(update.time).getTime(),
            })),
        })),
        data.variants,
        data.groups
    );
}

export async function handleImport(req: ApiRequest, res: ApiResponse): Promise<void> {
    const received = req.files?.import;
    if (!received || Array.isArray(received)) {
        sendError(res, 400, 'VALIDATION_ERROR', 'Exactly one import file is required');
        return;
    }
    try {
        if (!(await importArchive(received))) {
            sendError(res, 422, 'OPERATION_REJECTED', 'The archive could not be imported');
            return;
        }
        res.status(204).end();
    } catch (error) {
        sendError(res, 400, 'INVALID_IMPORT', `${error}`);
    }
}
