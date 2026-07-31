import { debugRequest } from '~/server/api/debug';
import { getProductsWithGroups } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { importEverything } from '~/server/data/common';
import { readImportArchive, writeImportImages, type ImportArchive } from '~/server/data/exportArchive';
import { getValidator } from '~/server/data/schema/getValidator';
import type { ApiProductsWithGroups, ApiRequest, ApiResponse } from '~/types/api';
import type { Update } from '~/types/data';

export async function handleImport(req: ApiRequest, res: ApiResponse<ApiProductsWithGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(
        await run<boolean, ApiProductsWithGroups>(
            async () => {
                const filesReceived = req.files?.import;
                if (!filesReceived) {
                    throw new Error('File required to import');
                }

                if (Array.isArray(filesReceived)) {
                    if (!filesReceived.length) {
                        throw new Error('File required to import');
                    }
                    // only one file is allowed
                    if (filesReceived.length > 1) {
                        throw new Error('Only one file can be imported at a time');
                    }
                }

                const { error } = console;
                const file = Array.isArray(filesReceived) ? filesReceived[0] : filesReceived;
                let archive: ImportArchive;
                try {
                    archive = await readImportArchive(file.data);
                } catch (_e) {
                    error(_e);
                    throw new Error('Invalid file content');
                }

                const validate = getValidator();
                if (!validate(archive.data)) {
                    error(validate.errors);
                    throw new Error('Invalid file content');
                }
                const { data } = archive;

                await writeImportImages(archive.images);

                return importEverything(
                    data.products.map((d) => ({
                        ...d,
                        updates: (d.updates as Update[] | undefined)?.map((u) => ({
                            ...u,
                            time: new Date(u.time).getTime(),
                        })),
                    })),
                    data.variants,
                    data.groups
                );
            },
            () => getProductsWithGroups()
        )
    );
}
