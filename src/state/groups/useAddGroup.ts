import { useCallback } from 'react';
import { useUpdateGroup } from '~/state/groups/useUpdateGroup';

export function useAddGroup(): (group: string, order?: number) => Promise<void> {
    const updateGroup = useUpdateGroup();
    return useCallback(
        async (group: string, order?: number): Promise<void> => updateGroup(group, order),
        [updateGroup]
    );
}
