import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { moveProductOccurrences } from '~/server/data/common';
import { renameProduct, setMissing, setProductExpiryTolerance, setProductParent } from '~/server/data/products';

export async function handlePatchProduct(req: ApiRequest, res: ApiResponse): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const name = requiredParam(req, res, 'name');
    if (!group || !name) {
        return;
    }
    const body = req.body as {
        name?: unknown;
        group?: unknown;
        newName?: unknown;
        parent?: unknown;
        expiryToleranceDays?: unknown;
        missing?: unknown;
    };
    const fields = ['name', 'group', 'parent', 'expiryToleranceDays', 'missing'].filter((field) => field in body);
    if (fields.length !== 1) {
        sendError(res, 400, 'VALIDATION_ERROR', 'Exactly one product field must be changed per request');
        return;
    }
    const [field] = fields;
    switch (field) {
        case 'name': {
            if (typeof body.name !== 'string') {
                sendError(res, 400, 'VALIDATION_ERROR', 'name must be a string');
                return;
            }
            await respond(res, () => renameProduct(group, name, body.name as string));
            return;
        }
        case 'group': {
            if (typeof body.group !== 'string' || (body.newName != null && typeof body.newName !== 'string')) {
                sendError(res, 400, 'VALIDATION_ERROR', 'group and newName must be strings');
                return;
            }
            await respond(res, () =>
                moveProductOccurrences(
                    group,
                    name,
                    body.group as string,
                    (body.newName as string | null | undefined) ?? undefined
                )
            );
            return;
        }
        case 'parent':
            if (body.parent != null && typeof body.parent !== 'string') {
                sendError(res, 400, 'VALIDATION_ERROR', 'parent must be a string or null');
                return;
            }
            await respond(res, () =>
                setProductParent(group, name, (body.parent as string | null | undefined) ?? undefined)
            );
            return;
        case 'expiryToleranceDays':
            if (
                typeof body.expiryToleranceDays !== 'number' ||
                !Number.isInteger(body.expiryToleranceDays) ||
                body.expiryToleranceDays < 0
            ) {
                sendError(res, 400, 'VALIDATION_ERROR', 'expiryToleranceDays must be a non-negative integer');
                return;
            }
            await respond(res, () => setProductExpiryTolerance(group, name, body.expiryToleranceDays as number));
            return;
        default:
            if (typeof body.missing !== 'boolean') {
                sendError(res, 400, 'VALIDATION_ERROR', 'missing must be a boolean');
                return;
            }
            await respond(res, () => setMissing(group, name, body.missing as boolean));
    }
}
