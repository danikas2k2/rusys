import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { trackFaroEvent } from '~/lib/observability/faro';
import { uploadWithProgress, type UploadProgress } from '~/lib/utils/uploadWithProgress';
import type { RenameGroup } from '~/schema';
import { renameGroupAction } from '~/server/actions/groups';

export function useRenameGroup(): (request: RenameGroup, onProgress?: UploadProgress) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (request: RenameGroup, onProgress?: UploadProgress): Promise<void> => {
            const { group, targetGroup, annual, review, image } = request;
            if (group && targetGroup && group !== targetGroup) {
                trackFaroEvent('data_action', { entity: 'group', action: 'rename', result: 'started' });
                try {
                    if (onProgress && image?.startsWith('data:')) {
                        await uploadWithProgress(
                            'PATCH',
                            `/api/v1/groups/${encodeURIComponent(group)}`,
                            JSON.stringify({ targetGroup, annual, review, image }),
                            onProgress
                        );
                    } else {
                        await renameGroupAction(request);
                    }
                    trackFaroEvent('data_action', { entity: 'group', action: 'rename', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'group', action: 'rename', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
