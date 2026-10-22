import * as schema from '~/schema';
import { renameGroupAction, updateGroupAction } from '~/server/actions/groups';
import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { sendError } from '~/server/api/v1/utils';

export async function handlePatchGroup(req: ApiRequest, res: ApiResponse): Promise<void> {
    try {
        const group = schema.validGroupName.parse(req.params.group);
        const { targetGroup, annual, review, image } = schema.renameGroup.partial().parse(req.body);
        if (targetGroup !== undefined) {
            await renameGroupAction({ group, targetGroup, annual, review, image });
        } else {
            await updateGroupAction({ group, annual, review, image });
        }
        res.status(204).end();
    } catch (cause) {
        if (cause instanceof schema.ZodError) {
            sendError(res, 400, 'VALIDATION_ERROR', schema.SchemaError.InvalidRequest);
            return;
        }

        const message = cause instanceof Error ? cause.message : undefined;
        switch (message) {
            case schema.SchemaError.InvalidRequest:
            case schema.SchemaError.CategoryAlreadyExists:
                sendError(res, 400, 'VALIDATION_ERROR', message);
                break;

            case schema.SchemaError.NotFound:
                sendError(res, 404, 'NOT_FOUND', schema.SchemaError.GroupNotFound);
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
