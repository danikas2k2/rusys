import { formatFileSize } from '@rusys/common/utils/format';
import type { Request } from 'express';
import type { UploadedFile } from 'express-fileupload';
import { isEmpty } from 'lodash';

// eslint-disable-next-line no-console
const debug: typeof console.debug = process.env.NODE_ENV === 'development' ? console.debug : () => {};
export { debug };

export function debugRequest(req: Request): void {
    debug();
    debug(`${req.method} ${req.url}`);
    if (!isEmpty(req.body)) {
        debug(JSON.stringify(truncateLongStrings(req.body), null, 2));
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

const MAX_LOGGED_STRING_LENGTH = 200;
const LOGGED_STRING_PREVIEW_LENGTH = 50;

// Long string values (e.g. base64 image data URLs) would otherwise flood the debug log.
function truncateLongStrings(value: unknown): unknown {
    if (typeof value === 'string') {
        return value.length > MAX_LOGGED_STRING_LENGTH
            ? `${value.slice(0, LOGGED_STRING_PREVIEW_LENGTH)}... (${formatFileSize(value.length)})`
            : value;
    }
    if (Array.isArray(value)) {
        return value.map(truncateLongStrings);
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, truncateLongStrings(v)]));
    }
    return value;
}
