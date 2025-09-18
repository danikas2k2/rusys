import moment from 'moment';

import { debugRequest } from '~/server/api/debug';
import { getDetailsWithGroups } from '~/server/api/response';
import { headerNoCache, run } from '~/server/api/utils';
import { importEverything } from '~/server/data/common';
import { getValidator } from '~/server/data/schema/getValidator';
import { type ApiDetailsWithGroups, type ApiExport, type ApiRequest, type ApiResponse } from '~/types/api';

export async function handleImport(req: ApiRequest, res: ApiResponse<ApiDetailsWithGroups>): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(
        await run<boolean, ApiDetailsWithGroups>(
            () => {
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
                let data: ApiExport;
                try {
                    data = JSON.parse(file.data.toString());
                } catch (_e) {
                    error(_e);
                    throw new Error('Invalid file content');
                }

                const validate = getValidator();
                if (!validate(data)) {
                    error(validate.errors);
                    throw new Error('Invalid file content');
                }

                return importEverything(
                    data.details.map((d) => ({
                        ...d,
                        updates: d.updates?.map((u) => ({
                            ...u,
                            time: moment(u.time).valueOf(),
                        })),
                    })),
                    data.variants,
                    data.groups
                );
            },
            () => getDetailsWithGroups()
        )
    );
}
