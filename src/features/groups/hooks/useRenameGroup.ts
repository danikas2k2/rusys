import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { uploadWithProgress, type UploadProgress } from '~/lib/utils/uploadWithProgress';
import { renameGroupAction } from '~/server/actions/groups';

export function useRenameGroup(): (
    group: string,
    newGroup: string,
    annual?: boolean,
    review?: boolean,
    image?: string,
    onProgress?: UploadProgress
) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (
            group: string,
            newGroup: string,
            annual?: boolean,
            review?: boolean,
            image?: string,
            onProgress?: UploadProgress
        ): Promise<void> => {
            if (group && newGroup && group !== newGroup) {
                if (onProgress && image?.startsWith('data:')) {
                    await uploadWithProgress(
                        'PATCH',
                        `/api/v1/groups/${encodeURIComponent(group)}`,
                        JSON.stringify({ name: newGroup, annual, review, image }),
                        onProgress
                    );
                } else {
                    await renameGroupAction(group, newGroup, annual, review, image);
                }
                await refresh();
            }
        },
        [refresh]
    );
}
