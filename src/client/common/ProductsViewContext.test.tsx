import { render, renderHook, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import React, { use } from 'react';

import { ProductsViewContext, ProductsViewWrapper, useProductsView } from '~/client/common/ProductsViewContext';

describe('<ProductsViewContext>', () => {
    it('uses context with default value', () => {
        const { result } = renderHook(() => use(ProductsViewContext));

        expect(result.current).toStrictEqual(['grid', expect.any(Function)]);
    });
});

describe('useProductsView', () => {
    it('returns grid view by default', () => {
        const { result } = renderHook(() => useProductsView());

        expect(result.current).toStrictEqual(['grid', expect.any(Function)]);
    });

    it('returns grid view when provided', () => {
        const setProductsView = vi.fn();
        const { result } = renderHook(() => useProductsView(), {
            wrapper: ({ children }) => (
                <ProductsViewContext value={['grid', setProductsView]}>{children}</ProductsViewContext>
            ),
        });

        expect(result.current).toStrictEqual(['grid', setProductsView]);
    });
});

describe('<ProductsViewWrapper>', () => {
    function Test() {
        const [productsView, setProductsView] = useProductsView();
        return <button onClick={() => setProductsView('table')}>{productsView}</button>;
    }

    afterEach(() => localStorage.clear());

    it('defaults to grid when localStorage is empty', () => {
        render(
            <ProductsViewWrapper>
                <Test />
            </ProductsViewWrapper>
        );

        expect(screen.getByRole('button')).toHaveTextContent('grid');
    });

    it('reads the initial value from localStorage', () => {
        localStorage.setItem('productsView', 'table');

        render(
            <ProductsViewWrapper>
                <Test />
            </ProductsViewWrapper>
        );

        expect(screen.getByRole('button')).toHaveTextContent('table');
    });

    it('ignores an unknown localStorage value and defaults to grid', () => {
        localStorage.setItem('productsView', 'nonsense');

        render(
            <ProductsViewWrapper>
                <Test />
            </ProductsViewWrapper>
        );

        expect(screen.getByRole('button')).toHaveTextContent('grid');
    });

    it('changes context and persists the new value to localStorage', async () => {
        render(
            <ProductsViewWrapper>
                <Test />
            </ProductsViewWrapper>
        );
        await user.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveTextContent('table');
        expect(localStorage.getItem('productsView')).toBe('table');
    });
});
