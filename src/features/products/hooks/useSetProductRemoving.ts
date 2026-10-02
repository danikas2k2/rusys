import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { getErrorMessage } from '~/lib/utils/errors';
import { setProductRemovingAction } from '~/server/actions/products';
import { setErrorAction } from '~/store/error/slice';
import { rollbackProductsRemovingAction, setProductsRemovingAction } from '~/store/products/slice';

export function useSetProductRemoving(): (
    group: string,
    name: string,
    year: number,
    removing: boolean
) => Promise<void> {
    const dispatch = useDispatch();
    const refresh = useGetProducts();
    return useCallback(
        async (group: string, name: string, year: number, removing: boolean): Promise<void> => {
            if (!group || !name || !year) {
                return;
            }

            dispatch(setProductsRemovingAction({ group, name, year, removing }));

            try {
                await setProductRemovingAction(group, name, year, removing);
                await refresh();
            } catch (error) {
                dispatch(rollbackProductsRemovingAction({ group, name, year }));
                dispatch(setErrorAction(getErrorMessage(error)));
            }
        },
        [refresh, dispatch]
    );
}
