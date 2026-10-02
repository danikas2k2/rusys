import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { getProductsAction } from '~/server/actions/products';
import { setGroupsAction } from '~/store/groups';
import { setProductsAction } from '~/store/products';
import { setVariantsAction } from '~/store/variants';
import { setYearsAction } from '~/store/years';

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
