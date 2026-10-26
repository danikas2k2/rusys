import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import { useGetGroups } from '~/features/groups/hooks/useGetGroups';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { ReorderGroups } from '~/schema';
import { reorderGroupsAction } from '~/server/actions/groups';

export function useReorderGroups(): (request: ReorderGroups) => Promise<void> {
    const refresh = useGetGroups();
    return useCallback(
        async (request: ReorderGroups): Promise<void> => {
            if (!isEmpty(request.groups)) {
                try {
                    await reorderGroupsAction(request);
                    trackFaroEvent('list_reordered', { list: 'groups', result: 'success' });
                } catch (error) {
                    trackFaroEvent('list_reordered', { list: 'groups', result: 'error' });
                    throw error;
                }
                await refresh();
            }
        },
        [refresh]
    );
}
