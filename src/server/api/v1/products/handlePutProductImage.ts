import * as schema from '~/schema';
import { setProductImageAction } from '~/server/actions/products';
import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { sendError } from '~/server/api/v1/utils';

export async function handlePutProductImage(req: ApiRequest, res: ApiResponse): Promise<void> {
    try {
        const body = schema.setProductImage.pick({ image: true }).strip().parse(req.body);
        const request = schema.setProductImage.parse({ ...body, ...req.params });
        await setProductImageAction(request);
        res.status(204).end();
    } catch (cause) {
        if (cause instanceof schema.ZodError) {
            sendError(res, 400, 'VALIDATION_ERROR', schema.SchemaError.InvalidRequest);
            return;
        }
        const message = cause instanceof Error ? cause.message : undefined;
        switch (message) {
            case schema.SchemaError.InvalidRequest:
                sendError(res, 400, 'VALIDATION_ERROR', message);
                break;
            case schema.SchemaError.RequestFailed:
                sendError(res, 422, 'OPERATION_REJECTED', schema.SchemaError.RequestFailed);
                break;
            case schema.SchemaError.Unauthorized:
                sendError(res, 401, 'UNAUTHORIZED', schema.SchemaError.Unauthorized);
                break;
            default:
                sendError(res, 500, 'INTERNAL_ERROR', schema.SchemaError.RequestFailed);
        }
    }
}
