import { useCallback } from 'react';

import { updateGroupAction } from '~/server/actions/groups';
import { useGetGroups } from '~/store/groups/useGetGroups';

export function useUpdateGroup(): (group: string, annual?: boolean, review?: boolean, image?: string) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (group: string, annual?: boolean, review?: boolean, image?: string): Promise<void> => {
            if (group) {
                await updateGroupAction(group, annual, review, image);
                await refresh();
            }
        },
        [refresh]
    );
}
