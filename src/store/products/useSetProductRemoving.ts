import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { getErrorMessage } from '~/lib/utils/errors';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { setErrorAction } from '~/store/error/actions';
import { rollbackProductsRemovingAction, setProductsRemovingAction } from '~/store/products/actions';
import { useGetProducts } from '~/store/products/useGetProducts';

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
                await request(API.productYear(group, name, year), { removing }, 'PATCH');
                await refresh();
            } catch (error) {
                dispatch(rollbackProductsRemovingAction(group, name, year));
                dispatch(setErrorAction(getErrorMessage(error)));
            }
        },
        [refresh, request, dispatch]
    );
}
