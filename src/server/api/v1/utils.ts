import type { VariantUnits } from '@rusys/common/data';
import type { Request, Response } from 'express';

const VARIANT_UNITS = new Set<VariantUnits>(['g', 'kg', 'l', 'ml', 'vnt']);

export function sendError(res: Response, status: number, code: string, message: string): void {
    res.status(status).json({ error: { code, message } });
}

export function requiredParam(req: Request, res: Response, name: string): string | undefined {
    const value = req.params[name];
    if (typeof value !== 'string' || !value) {
        sendError(res, 400, 'VALIDATION_ERROR', `${name} is required`);
        return undefined;
    }
    return value;
}

export function requiredYear(req: Request, res: Response): number | undefined {
    const value = Number(req.params.year);
    if (!Number.isInteger(value)) {
        sendError(res, 400, 'VALIDATION_ERROR', 'year must be an integer');
        return undefined;
    }
    return value;
}

export function isVariantUnits(value: unknown): value is VariantUnits {
    return typeof value === 'string' && VARIANT_UNITS.has(value as VariantUnits);
}

export async function respond(
    res: Response,
    action: () => Promise<boolean>,
    body?: () => Promise<Record<string, unknown>>
): Promise<void> {
    try {
        if (!(await action())) {
            sendError(res, 422, 'OPERATION_REJECTED', 'The requested change could not be applied');
            return;
        }
        res.status(body ? 200 : 204).json(body ? await body() : undefined);
    } catch (error) {
        sendError(res, 500, 'INTERNAL_ERROR', `${error}`);
    }
}
