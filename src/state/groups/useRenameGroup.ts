import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type ApiRenameGroup, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { renameGroupAction } from '~/state/groups/actions';

export function useRenameGroup(): (group: string, newGroup: string) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiRenameGroup>();
    return useCallback(
        async (group: string, newGroup: string): Promise<void> => {
            if (newGroup && group !== newGroup) {
                dispatch(renameGroupAction(group, newGroup));
                return request(ApiUrl.GroupsRename, { group, newGroup });
            }
        },
        [request, dispatch]
    );
}
