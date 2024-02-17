import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type ApiUpdateGroup, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { updateGroupAction } from '~/state/groups/actions';

export function useUpdateGroup(): (group: string, order?: number) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiUpdateGroup>();
    return useCallback(
        async (group: string, order?: number): Promise<void> => {
            dispatch(updateGroupAction(group, order));
            return request(ApiUrl.GroupsUpdate, { group, order });
        },
        [request, dispatch]
    );
}
