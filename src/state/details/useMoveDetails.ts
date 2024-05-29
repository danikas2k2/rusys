import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type ApiMoveDetails, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { moveDetailsAction } from '~/state/details/actions';

export function useMoveDetails(): (group: string, name: string, newGroup: string) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiMoveDetails>();
    return useCallback(
        async (group: string, name: string, newGroup: string): Promise<void> => {
            if (group && name && newGroup && group !== newGroup) {
                dispatch(moveDetailsAction(group, name, newGroup));
                return request(ApiUrl.DetailsMove, { group, name, newGroup });
            }
        },
        [request, dispatch]
    );
}
