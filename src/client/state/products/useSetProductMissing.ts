import { API } from '@rusys/common/api/v1';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { setErrorAction } from '~/client/state/error/actions';
import { rollbackProductsMissingAction, setProductsMissingAction } from '~/client/state/products/actions';
import { useGetProducts } from '~/client/state/products/useGetProducts';
import { getErrorMessage } from '~/client/utils/errors';

export function useSetProductMissing(): (group: string, name: string, missing: boolean) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, missing: boolean): Promise<void> => {
            if (!group || !name) {
                return;
            }

            dispatch(setProductsMissingAction(group, name, missing));

            try {
                await request(API.groupProduct(group, name), { missing }, 'PATCH');
                await refresh();
            } catch (error) {
                dispatch(rollbackProductsMissingAction(group, name));
                dispatch(setErrorAction(getErrorMessage(error)));
            }
        },
        [refresh, request, dispatch]
    );
}
