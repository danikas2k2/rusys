import type { Update } from '@rusys/common/data';
import type { Router } from 'express';
import type { UploadedFile } from 'express-fileupload';

import { sendError } from '~/server/api/v1/utils';
import { importEverything } from '~/server/data/common';
import { readImportArchive, writeImportImages } from '~/server/data/exportArchive';
import { getValidator } from '~/server/data/schema/getValidator';

async function importArchive(file: UploadedFile): Promise<boolean> {
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

export function registerImportHandler(router: Router): void {
    router.post('/imports', async (req, res) => {
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
    });
}
