import { type Request } from 'express';
import { isEmpty } from 'lodash';

const { debug } = console;
export { debug };

export function debugRequest(req: Request): void {
    debug();
    debug(`${req.method} ${req.url}`);
    if (!isEmpty(req.body)) {
        debug(JSON.stringify(req.body, null, 2));
    }
}
