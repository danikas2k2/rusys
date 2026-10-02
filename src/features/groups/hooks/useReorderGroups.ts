import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { reorderGroupsAction } from '~/server/actions/groups';

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
