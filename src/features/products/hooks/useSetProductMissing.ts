import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { getErrorMessage } from '~/lib/utils/errors';
import { setProductMissingAction } from '~/server/actions/products';
import { setErrorAction } from '~/store/error';
import { rollbackProductsMissingAction, setProductsMissingAction } from '~/store/products';

export function useSetProductMissing(): (group: string, name: string, missing: boolean) => Promise<void> {
    const dispatch = useDispatch();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, missing: boolean): Promise<void> => {
            if (!group || !name) {
                return;
            }

            dispatch(setProductsMissingAction({ group, name, missing }));

            try {
                await setProductMissingAction(group, name, missing);
                await refresh();
            } catch (error) {
                dispatch(rollbackProductsMissingAction({ group, name }));
                dispatch(setErrorAction(getErrorMessage(error)));
            }
        },
        [refresh, dispatch]
    );
}
