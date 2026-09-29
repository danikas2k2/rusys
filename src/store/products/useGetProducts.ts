import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { readProducts } from '~/server/actions/readData';
import { setGroupsAction } from '~/store/groups/actions';
import { setProductsAction } from '~/store/products/actions';
import { setVariantsAction } from '~/store/variants/actions';
import { setYearsAction } from '~/store/years/actions';

export function useGetProducts(): (initial?: boolean) => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(async (): Promise<void> => {
        const data = await readProducts();
        dispatch(setProductsAction(data.products));
        dispatch(setYearsAction(data.years));
        dispatch(setGroupsAction([...data.groups]));
        dispatch(setVariantsAction([...data.variants]));
    }, [dispatch]);
}
