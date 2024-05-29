import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type ApiRequestGroup, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { deleteGroupAction } from '~/state/groups/actions';

export function useDeleteGroup(): (group: string) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiRequestGroup>();
    return useCallback(
        async (group: string): Promise<void> => {
            if (group) {
                dispatch(deleteGroupAction(group));
                return request(ApiUrl.GroupsDelete, { group });
            }
        },
        [request, dispatch]
    );
}
