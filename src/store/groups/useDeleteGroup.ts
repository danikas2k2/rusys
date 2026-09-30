import { useCallback } from 'react';

import { deleteGroupAction } from '~/server/actions/groups';
import { useGetGroups } from '~/store/groups/useGetGroups';

export function useDeleteGroup(): (group: string) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (group: string): Promise<void> => {
            if (group) {
                await deleteGroupAction(group);
                await refresh();
            }
        },
        [refresh]
    );
}
