import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setProductsRemovingAction } from '~/client/state/products/actions';
import { ApiUrl, type ApiSetRemoving } from '~/types/api';

export function useSetProductRemoving(): (
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
                await request(ApiUrl.ProductsSetRemoving, { group, name, year, removing });
                dispatch(setProductsRemovingAction(group, name, year, removing));
            }
        },
        [request, dispatch]
    );
}
