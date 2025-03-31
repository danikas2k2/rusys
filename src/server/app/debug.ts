import { type Request } from 'express';
import { type UploadedFile } from 'express-fileupload';
import { isEmpty } from 'lodash';

const { debug } = console;
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
                Object.values(req.files).flatMap((f) => (Array.isArray(f) ? f.map(f2s) : f2s(f))),
                null,
                2
            )
        );
    }
}

function f2s(f: UploadedFile): string {
    return `${f.name} (${n2k(f.size)})`;
}

const k = 'KMGTPEZY';
function n2k(n: number): string {
    let x = -1;
    while (n >= 1024) {
        n /= 1024;
        x++;
    }
    return `${n.toFixed(1)}${k[x]}`;
}
