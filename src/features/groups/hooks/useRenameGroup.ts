import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { trackFaroEvent } from '~/lib/observability/faro';
import { type UploadProgress } from '~/lib/utils/uploadWithProgress';
import { SchemaError, type RenameGroup } from '~/schema';
import { renameGroupAction } from '~/server/actions/groups';

export function useRenameGroup(): (request: RenameGroup, onProgress?: UploadProgress) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (request: RenameGroup, _onProgress?: UploadProgress): Promise<void> => {
            const { group, targetGroup } = request;
            if (group && targetGroup && group !== targetGroup) {
                trackFaroEvent('data_action', { entity: 'group', action: 'rename', result: 'started' });
                try {
                    const result = await renameGroupAction(request);
                    if (result?.imageUnavailable) {
                        await refresh();
                        throw new Error(SchemaError.ImageUnavailable);
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
