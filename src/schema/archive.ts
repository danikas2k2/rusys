import z from 'zod';

import { MAX_IMPORT_FILE_SIZE } from '~/common/utils/files';
import { SchemaError } from '~/schema/errors';

export const importArchive = z.instanceof(FormData, { error: SchemaError.InvalidZipFile }).transform((data, ctx) => {
    const files = data.getAll('import');
    if (files.length !== 1 || [...data.keys()].some((key) => key !== 'import')) {
        ctx.addIssue({ code: 'custom', message: SchemaError.ImportFileRequired });
        return z.NEVER;
    }
    const [file] = files;
    if (!(file instanceof File) || file.size > MAX_IMPORT_FILE_SIZE) {
        ctx.addIssue({ code: 'custom', message: SchemaError.InvalidZipFile });
        return z.NEVER;
    }
    return file;
});

export type ImportArchive = z.input<typeof importArchive>;
