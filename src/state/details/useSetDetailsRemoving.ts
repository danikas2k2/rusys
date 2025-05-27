import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { setDetailsRemovingAction } from '~/state/details/actions';
import { ApiUrl, type ApiSetRemoving } from '~/types/api';

export function useSetDetailsRemoving(): (
    group: string,
    name: string,
    year: number,
    removing: boolean
) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest<ApiSetRemoving>();
    return useCallback(
        async (group: string, name: string, year: number, removing: boolean): Promise<void> => {
            if (group && name && year) {
                await request(ApiUrl.DetailsSetRemoving, { group, name, year, removing });
                dispatch(setDetailsRemovingAction(group, name, year, removing));
            }
        },
        [request, dispatch]
    );
}
