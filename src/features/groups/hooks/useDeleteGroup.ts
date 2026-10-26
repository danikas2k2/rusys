import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { DeleteGroup } from '~/schema';
import { deleteGroupAction } from '~/server/actions/groups';

export function useDeleteGroup(): (request: DeleteGroup) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (request: DeleteGroup): Promise<void> => {
            if (request.group) {
                trackFaroEvent('data_action', { entity: 'group', action: 'delete', result: 'started' });
                try {
                    await deleteGroupAction(request);
                    trackFaroEvent('data_action', { entity: 'group', action: 'delete', result: 'success' });
                } catch (error) {
                    trackFaroEvent('data_action', { entity: 'group', action: 'delete', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
