import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { uploadWithProgress, type UploadProgress } from '~/lib/utils/uploadWithProgress';
import type { UpdateGroup } from '~/schema';
import { updateGroupAction } from '~/server/actions/groups';

export function useUpdateGroup(): (request: UpdateGroup, onProgress?: UploadProgress) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (request: UpdateGroup, onProgress?: UploadProgress): Promise<void> => {
            const { group, annual, review, image } = request;
            if (group) {
                if (onProgress && image?.startsWith('data:')) {
                    await uploadWithProgress(
                        'PUT',
                        `/api/v1/groups/${encodeURIComponent(group)}`,
                        JSON.stringify({ annual, review, image }),
                        onProgress
                    );
                } else {
                    await updateGroupAction(request);
                }
                await refresh();
            }
        },
        [refresh]
    );
}
