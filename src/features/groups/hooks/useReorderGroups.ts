import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import type { ReorderGroups } from '~/schema';
import { reorderGroupsAction } from '~/server/actions/groups';

export function useReorderGroups(): (request: ReorderGroups) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (request: ReorderGroups): Promise<void> => {
            if (!isEmpty(request.groups)) {
                await reorderGroupsAction(request);
                await refresh();
            }
        },
        [refresh]
    );
}
