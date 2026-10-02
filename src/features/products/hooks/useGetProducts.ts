import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { getProductsAction } from '~/server/actions/products';
import { setGroupsAction } from '~/store/groups/slice';
import { setProductsAction } from '~/store/products/slice';
import { setVariantsAction } from '~/store/variants/slice';
import { setYearsAction } from '~/store/years/slice';

export function useGetProducts(): (initial?: boolean) => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(async (): Promise<void> => {
        const data = await getProductsAction();
        dispatch(setProductsAction(data.products));
        dispatch(setYearsAction(data.years));
        dispatch(setGroupsAction([...data.groups]));
        dispatch(setVariantsAction([...data.variants]));
    }, [dispatch]);
}
