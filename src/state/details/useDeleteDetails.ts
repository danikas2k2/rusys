import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type ApiRequestDetails, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { deleteDetailsAction } from '~/state/details/actions';

export function useDeleteDetails(): (group: string, name: string) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiRequestDetails>();
    return useCallback(
        async (group: string, name: string): Promise<void> => {
            dispatch(deleteDetailsAction(group, name));
            if (name) {
                return request(ApiUrl.DetailsDelete, { group, name });
            }
        },
        [request, dispatch]
    );
}
