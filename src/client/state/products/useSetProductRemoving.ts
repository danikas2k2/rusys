import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setErrorAction } from '~/client/state/error/actions';
import { rollbackProductsRemovingAction, setProductsRemovingAction } from '~/client/state/products/actions';
import { getErrorMessage } from '~/client/utils/errors';
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
            if (!group || !name || !year) {
                return;
            }

            dispatch(setProductsRemovingAction(group, name, year, removing));

            try {
                await request(ApiUrl.ProductsSetRemoving, { group, name, year, removing });
            } catch (error) {
                dispatch(rollbackProductsRemovingAction(group, name, year));
                dispatch(setErrorAction(getErrorMessage(error)));
            }
        },
        [request, dispatch]
    );
}
