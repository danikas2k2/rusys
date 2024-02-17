import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type ApiRenameDetails, ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { renameDetailsAction } from '~/state/details/actions';

export function useRenameDetails(): (group: string, name: string, newName: string) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiRenameDetails>();
    return useCallback(
        async (group: string, name: string, newName: string): Promise<void> => {
            if (newName && name !== newName) {
                dispatch(renameDetailsAction(group, name, newName));
                return request(ApiUrl.DetailsRename, { group, name, newName });
            }
        },
        [request, dispatch]
    );
}
