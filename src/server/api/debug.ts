import { formatFileSize } from '~/common/utils/format';
import { type Request } from 'express';
import { type UploadedFile } from 'express-fileupload';
import { isEmpty } from 'lodash';

// eslint-disable-next-line no-console
const debug: typeof console.debug = process.env.NODE_ENV === 'development' ? console.debug : () => {};
export { debug };

export function debugRequest(req: Request): void {
    debug();
    debug(`${req.method} ${req.url}`);
    if (!isEmpty(req.body)) {
        debug(JSON.stringify(req.body, null, 2));
    }
    if (!isEmpty(req.files)) {
        debug(
            JSON.stringify(
                Object.values(req.files).flatMap((f) => (Array.isArray(f) ? f.map(formatFileInfo) : formatFileInfo(f))),
                null,
                2
            )
        );
    }
}

function formatFileInfo(f: UploadedFile): string {
    return `${f.name} (${formatFileSize(f.size)})`;
}
