import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { deleteGroupAction } from '~/server/actions/groups';

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
