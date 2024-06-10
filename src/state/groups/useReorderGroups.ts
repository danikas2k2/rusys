import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type ApiReorderGroups, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { reorderGroupsAction } from '~/state/groups/actions';

export function useReorderGroups(): (groups: Readonly<Record<string, number>>) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiReorderGroups>();
    return useCallback(
        async (groups: Readonly<Record<string, number>>): Promise<void> => {
            if (Object.keys(groups).length) {
                dispatch(reorderGroupsAction(groups));
                return request(ApiUrl.GroupsReorder, { groups });
            }
        },
        [request, dispatch]
    );
}
