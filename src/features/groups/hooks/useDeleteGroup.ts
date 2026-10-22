import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import type { DeleteGroup } from '~/schema';
import { deleteGroupAction } from '~/server/actions/groups';

export function useDeleteGroup(): (request: DeleteGroup) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (request: DeleteGroup): Promise<void> => {
            if (request.group) {
                await deleteGroupAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
