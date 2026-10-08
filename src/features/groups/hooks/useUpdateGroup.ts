import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { uploadWithProgress, type UploadProgress } from '~/lib/utils/uploadWithProgress';
import { updateGroupAction } from '~/server/actions/groups';

export function useUpdateGroup(): (
    group: string,
    annual?: boolean,
    review?: boolean,
    image?: string,
    onProgress?: UploadProgress
) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (
            group: string,
            annual?: boolean,
            review?: boolean,
            image?: string,
            onProgress?: UploadProgress
        ): Promise<void> => {
            if (group) {
                if (onProgress && image?.startsWith('data:')) {
                    await uploadWithProgress(
                        'PUT',
                        `/api/v1/groups/${encodeURIComponent(group)}`,
                        JSON.stringify({ annual, review, image }),
                        onProgress
                    );
                } else {
                    await updateGroupAction(group, annual, review, image);
                }
                await refresh();
            }
        },
        [refresh]
    );
}
