import { SchemaError, setVariantImageSchema, ZodError } from '~/schema';
import { setVariantImageAction } from '~/server/actions/products';
import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { sendError } from '~/server/api/v1/utils';

export async function handlePutProductVariantImage(req: ApiRequest, res: ApiResponse): Promise<void> {
    try {
        const body = setVariantImageSchema.pick({ image: true }).strip().parse(req.body);
        const request = setVariantImageSchema.parse({ ...body, ...req.params });
        await setVariantImageAction(request);
        res.status(204).end();
    } catch (cause) {
        if (cause instanceof ZodError) {
            sendError(res, 400, 'VALIDATION_ERROR', SchemaError.InvalidRequest);
            return;
        }
        const message = cause instanceof Error ? cause.message : undefined;
        switch (message) {
            case SchemaError.InvalidRequest:
                sendError(res, 400, 'VALIDATION_ERROR', message);
                break;
            case SchemaError.RequestFailed:
                sendError(res, 422, 'OPERATION_REJECTED', SchemaError.RequestFailed);
                break;
            case SchemaError.Unauthorized:
                sendError(res, 401, 'UNAUTHORIZED', SchemaError.Unauthorized);
                break;
            default:
                sendError(res, 500, 'INTERNAL_ERROR', SchemaError.RequestFailed);
        }
    }
}
