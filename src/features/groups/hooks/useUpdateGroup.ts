import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { trackFaroEvent } from '~/lib/observability/faro';
import { type UploadProgress } from '~/lib/utils/uploadWithProgress';
import { SchemaError, type UpdateGroup } from '~/schema';
import { updateGroupAction } from '~/server/actions/groups';

export function useUpdateGroup(): (request: UpdateGroup, onProgress?: UploadProgress) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (request: UpdateGroup, _onProgress?: UploadProgress): Promise<void> => {
            const { group } = request;
            if (group) {
                trackFaroEvent('data_action', { entity: 'group', action: 'update', result: 'started' });
                try {
                    const result = await updateGroupAction(request);
                    if (result?.imageUnavailable) {
                        await refresh();
                        throw new Error(SchemaError.ImageUnavailable);
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
