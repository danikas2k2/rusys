import { ApiV1 } from '@rusys/common/api/v1';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setErrorAction } from '~/client/state/error/actions';
import { rollbackProductsRemovingAction, setProductsRemovingAction } from '~/client/state/products/actions';
import { useGetProducts } from '~/client/state/products/useGetProducts';
import { getErrorMessage } from '~/client/utils/errors';

export function useSetProductRemoving(): (
    group: string,
    name: string,
    year: number,
    removing: boolean
) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, year: number, removing: boolean): Promise<void> => {
            if (!group || !name || !year) {
                return;
            }

            dispatch(setProductsRemovingAction(group, name, year, removing));

            try {
                await request(ApiV1.productYear(group, name, year), { removing }, 'PATCH');
                await refresh();
            } catch (error) {
                dispatch(rollbackProductsRemovingAction(group, name, year));
                dispatch(setErrorAction(getErrorMessage(error)));
            }
        },
        [refresh, request, dispatch]
    );
}
