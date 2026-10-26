import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { trackFaroEvent } from '~/lib/observability/faro';
import { uploadWithProgress, type UploadProgress } from '~/lib/utils/uploadWithProgress';
import type { UpdateGroup } from '~/schema';
import { updateGroupAction } from '~/server/actions/groups';

export function useUpdateGroup(): (request: UpdateGroup, onProgress?: UploadProgress) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (request: UpdateGroup, onProgress?: UploadProgress): Promise<void> => {
            const { group, annual, review, image } = request;
            if (group) {
                trackFaroEvent('data_action', { entity: 'group', action: 'update', result: 'started' });
                try {
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
                    trackFaroEvent('data_action', { entity: 'group', action: 'update', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'group', action: 'update', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
