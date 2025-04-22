import { type ApiAllDetails, type ApiExport, type ApiRequest, type ApiResponse } from '~/common/api';
import { debugRequest } from '~/server/app/debug';
import { headerNoCache, run } from '~/server/app/utils';
import { importEverything } from '~/server/data/common';
import { getAllDetails } from '~/server/data/details';
import { getValidator } from '~/server/data/schema/getValidator';

const validate = getValidator();

export async function handleImport(req: ApiRequest, res: ApiResponse): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(
        await run<boolean, ApiAllDetails>(
            () => {
                const filesReceived = req.files?.import;
                if (!filesReceived) {
                    throw new Error('No files found');
                }

                if (Array.isArray(filesReceived)) {
                    if (!filesReceived.length) {
                        throw new Error('No files found');
                    }
                    // only one file is allowed
                    if (filesReceived.length > 1) {
                        throw new Error('To many files found');
                    }
                }

                const file = Array.isArray(filesReceived) ? filesReceived[0] : filesReceived;
                const data: ApiExport = JSON.parse(file.data.toString());
                if (!validate(data)) {
                    throw new Error(
                        [
                            'File content does not match the required schema',
                            JSON.stringify(validate.errors, null, 2),
                        ].join('\n')
                    );
                }

                return importEverything(data.details, data.variants, data.groups);
            },
            () => getAllDetails()
        )
    );
}
