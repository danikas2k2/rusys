import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { updateGroupAction } from '~/server/actions/groups';

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
