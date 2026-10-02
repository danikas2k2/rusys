import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { renameGroupAction } from '~/server/actions/groups';

export function useRenameGroup(): (
    group: string,
    newGroup: string,
    annual?: boolean,
    review?: boolean,
    image?: string
) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (group: string, newGroup: string, annual?: boolean, review?: boolean, image?: string): Promise<void> => {
            if (group && newGroup && group !== newGroup) {
                await renameGroupAction(group, newGroup, annual, review, image);
                await refresh();
            }
        },
        [refresh]
    );
}
