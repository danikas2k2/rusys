import z from 'zod';

import { MAX_IMPORT_FILE_SIZE } from '~/common/utils/files';
import { SchemaError } from '~/schema/errors';

/**
 * Accepts FormData containing exactly one `import` File and returns that File.
 * Rejects other fields and files above MAX_IMPORT_FILE_SIZE; ZIP contents are checked by the import handler.
 */
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

/** Request input is FormData; successful parsing produces a File. */
export type ImportArchive = z.input<typeof importArchive>;
