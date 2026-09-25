import type { ApiRequest, ApiResponse } from '~/server/api/next';
import { requiredParam, respond, sendError } from '~/server/api/v1/utils';
import { renameGroupOccurrences } from '~/server/data/common';
import { getGroups, updateGroup } from '~/server/data/groups';

export async function handlePatchGroup(req: ApiRequest, res: ApiResponse): Promise<void> {
    const group = requiredParam(req, res, 'group');
    if (!group) {
        return;
    }
    const { name, annual, review, image } = req.body as {
        name?: unknown;
        annual?: unknown;
        review?: unknown;
        image?: unknown;
    };
    if (
        (name != null && typeof name !== 'string') ||
        (annual != null && typeof annual !== 'boolean') ||
        (review != null && typeof review !== 'boolean') ||
        (image != null && typeof image !== 'string')
    ) {
        sendError(res, 400, 'VALIDATION_ERROR', 'name and image must be strings; annual and review must be booleans');
        return;
    }
    const current = (await getGroups()).find((item) => item.group === group);
    if (!current) {
        sendError(res, 404, 'NOT_FOUND', 'Group not found');
        return;
    }
    const nextAnnual = typeof annual === 'boolean' ? annual : current.annual;
    const nextReview = typeof review === 'boolean' ? review : current.review;
    const nextImage = typeof image === 'string' ? image : current.image;
    await respond(res, () =>
        typeof name === 'string' && name !== group
            ? renameGroupOccurrences(group, name, nextAnnual, nextReview, nextImage)
            : updateGroup(group, nextAnnual, nextReview, nextImage)
    );
}
