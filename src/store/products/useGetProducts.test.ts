import { renderHook } from '@testing-library/react';

import { useDispatch } from 'react-redux';

import { getProductsAction } from '~/server/actions/products';
import { setGroupsAction } from '~/store/groups/actions';
import { setProductsAction } from '~/store/products/actions';
import { useGetProducts } from '~/store/products/useGetProducts';
import { setVariantsAction } from '~/store/variants/actions';
import { setYearsAction } from '~/store/years/actions';

vi.mock(import('~/server/actions/products'));
vi.mock(import('react-redux'), async () => ({ ...(await vi.importActual('react-redux')), useDispatch: vi.fn() }));

describe('useGetProducts', () => {
    const dispatch = vi.fn();
    const products = [{ group: 'Food', name: 'Rice', years: [] }];
    const years = [26];
    const groups = [{ group: 'Food', order: 0 }];
    const variants = [{ group: 'Food', variant: 'Box', order: 0 }];

    beforeEach(() => vi.mocked(useDispatch).mockReturnValue(dispatch));

    afterEach(() => vi.clearAllMocks());

    it('refreshes products and their dependent collections', async () => {
        vi.mocked(getProductsAction).mockResolvedValue({ products, years, groups, variants });
        const { result } = renderHook(() => useGetProducts());
        await result.current();

        expect(getProductsAction).toHaveBeenCalledWith();
        expect(dispatch).toHaveBeenCalledWith(setProductsAction(products));
        expect(dispatch).toHaveBeenCalledWith(setYearsAction(years));
        expect(dispatch).toHaveBeenCalledWith(setGroupsAction(groups));
        expect(dispatch).toHaveBeenCalledWith(setVariantsAction(variants));
        expect(dispatch).toHaveBeenCalledTimes(4);
    });

    it('also loads dependent collections initially', async () => {
        vi.mocked(getProductsAction).mockResolvedValue({ products, years, groups, variants });
        const { result } = renderHook(() => useGetProducts());
        await result.current(true);

        expect(getProductsAction).toHaveBeenCalledWith();
        expect(dispatch).toHaveBeenCalledWith(setGroupsAction(groups));
        expect(dispatch).toHaveBeenCalledWith(setVariantsAction(variants));
    });
});
