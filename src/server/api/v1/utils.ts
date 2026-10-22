import { SchemaError } from '~/schema';
import type { ApiRequest, ApiResponse } from '~/server/api/next';

const requiredParamErrors: Record<string, SchemaError> = {
    group: SchemaError.GroupParamRequired,
    name: SchemaError.NameRequired,
    variant: SchemaError.VariantRequired,
    email: SchemaError.EmailRequired,
};

export function sendError(res: ApiResponse, status: number, code: string, message: string): void {
    res.status(status).json({ error: { code, message } });
}

export function requiredParam(req: ApiRequest, res: ApiResponse, name: string): string | undefined {
    const value = req.params[name];
    if (typeof value !== 'string' || !value) {
        sendError(res, 400, 'VALIDATION_ERROR', requiredParamErrors[name] ?? SchemaError.InvalidRequest);
        return undefined;
    }
    return value;
}

export async function respond(
    res: ApiResponse,
    action: () => Promise<boolean>,
    body?: () => Promise<Record<string, unknown>>
): Promise<void> {
    try {
        if (!(await action())) {
            sendError(res, 422, 'OPERATION_REJECTED', SchemaError.RequestFailed);
            return;
        }
        res.status(body ? 200 : 204).json(body ? await body() : undefined);
    } catch {
        sendError(res, 500, 'INTERNAL_ERROR', SchemaError.RequestFailed);
    }
}
