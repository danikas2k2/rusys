import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import { reorderGroupsAction } from '~/server/actions/groups';
import { useGetGroups } from '~/store/groups/useGetGroups';

export function useReorderGroups(): (groups: Readonly<Record<string, number>>) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (groups: Readonly<Record<string, number>>): Promise<void> => {
            if (!isEmpty(groups)) {
                await reorderGroupsAction(groups);
                await refresh();
            }
        },
        [refresh]
    );
}
