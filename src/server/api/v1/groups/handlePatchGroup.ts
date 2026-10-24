import { groupIdentitySchema, renameGroupSchema, SchemaError, ZodError } from '~/schema';
import { renameGroupAction, updateGroupAction } from '~/server/actions/groups';
import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { sendError } from '~/server/api/v1/utils';

export async function handlePatchGroup(req: ApiRequest, res: ApiResponse): Promise<void> {
    try {
        const { group } = groupIdentitySchema.parse(req.params);
        const { targetGroup, annual, review, image } = renameGroupSchema.partial().parse(req.body);
        if (targetGroup !== undefined) {
            await renameGroupAction({ group, targetGroup, annual, review, image });
        } else {
            await updateGroupAction({ group, annual, review, image });
        }
        res.status(204).end();
    } catch (cause) {
        if (cause instanceof ZodError) {
            sendError(res, 400, 'VALIDATION_ERROR', SchemaError.InvalidRequest);
            return;
        }

        const message = cause instanceof Error ? cause.message : undefined;
        switch (message) {
            case SchemaError.InvalidRequest:
            case SchemaError.CategoryAlreadyExists:
                sendError(res, 400, 'VALIDATION_ERROR', message);
                break;

            case SchemaError.NotFound:
                sendError(res, 404, 'NOT_FOUND', SchemaError.GroupNotFound);
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
