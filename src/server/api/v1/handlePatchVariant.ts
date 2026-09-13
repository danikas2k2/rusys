import type { Request, Response } from 'express';

import { isVariantUnits, requiredParam, sendError } from '~/server/api/v1/utils';
import { renameVariantOccurrences } from '~/server/data/common';
import { getVariants, updateVariant } from '~/server/data/variants';

export async function handlePatchVariant(req: Request, res: Response): Promise<void> {
    const group = requiredParam(req, res, 'group');
    const variant = requiredParam(req, res, 'variant');
    if (!group || !variant) {
        return;
    }
    const { name, order, suffix, count, units } = req.body as {
        name?: unknown;
        order?: unknown;
        suffix?: unknown;
        count?: unknown;
        units?: unknown;
    };
    if (
        (name != null && typeof name !== 'string') ||
        (order != null && typeof order !== 'number') ||
        (suffix != null && typeof suffix !== 'string') ||
        (count != null && typeof count !== 'number') ||
        (units != null && !isVariantUnits(units))
    ) {
        sendError(res, 400, 'VALIDATION_ERROR', 'Variant fields have invalid types');
        return;
    }
    const current = (await getVariants()).find((item) => item.group === group && item.variant === variant);
    if (!current) {
        sendError(res, 404, 'NOT_FOUND', 'Variant not found');
        return;
    }
    const update = {
        order: typeof order === 'number' ? order : current.order,
        suffix: typeof suffix === 'string' ? suffix : current.suffix,
        count: typeof count === 'number' ? count : current.count,
        units: isVariantUnits(units) ? units : current.units,
    };
    try {
        const renamed = typeof name === 'string' && name !== variant;
        if (renamed && !(await renameVariantOccurrences(group, variant, name, update))) {
            sendError(res, 409, 'CONFLICT', 'The variant could not be renamed');
            return;
        }
        if (!renamed && !(await updateVariant(group, variant, update))) {
            sendError(res, 422, 'OPERATION_REJECTED', 'The requested change could not be applied');
            return;
        }
        res.status(204).end();
    } catch (error) {
        sendError(res, 500, 'INTERNAL_ERROR', `${error}`);
    }
}
