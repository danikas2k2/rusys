import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type ApiSwitchGroups, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { switchGroupsAction } from '~/state/groups/actions';

export function useSwitchGroups(): (group: string, oppositeGroup: string) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiSwitchGroups>();
    return useCallback(
        async (group: string, oppositeGroup: string): Promise<void> => {
            dispatch(switchGroupsAction(group, oppositeGroup));
            return request(ApiUrl.GroupsSwitch, { group, oppositeGroup });
        },
        [request, dispatch]
    );
}
