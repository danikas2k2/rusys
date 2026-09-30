import type { VariantUnits } from '~/common/data';
import type { ApiRequest, ApiResponse } from '~/server/api/next';

export const VARIANT_UNITS = new Set<VariantUnits>(['g', 'kg', 'l', 'ml', 'vnt']);

export function sendError(res: ApiResponse, status: number, code: string, message: string): void {
    res.status(status).json({ error: { code, message } });
}

export function requiredParam(req: ApiRequest, res: ApiResponse, name: string): string | undefined {
    const value = req.params[name];
    if (typeof value !== 'string' || !value) {
        sendError(res, 400, 'VALIDATION_ERROR', `${name} is required`);
        return undefined;
    }
    return value;
}

export function requiredYear(req: ApiRequest, res: ApiResponse): number | undefined {
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
    res: ApiResponse,
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
