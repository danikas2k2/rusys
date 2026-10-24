import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { getGroupsAction } from '~/server/actions/groups';
import { CATALOG_KEYS } from '~/store/catalog';

export function useGetGroups(): (initial?: boolean) => Promise<void> {
    const client = useQueryClient();
    return useCallback(async (): Promise<void> => {
        client.setQueryData(CATALOG_KEYS.groups, [...(await getGroupsAction())]);
    }, [client]);
}
