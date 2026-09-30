import { useCallback } from 'react';

import { renameGroupAction } from '~/server/actions/groups';
import { useGetGroups } from '~/store/groups/useGetGroups';

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
