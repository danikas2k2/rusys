import { noop } from 'lodash';
import React, { createContext, use, useCallback, useState } from 'react';

export type ProductsView = 'grid' | 'table';

const STORAGE_KEY = 'productsView';

function readInitialProductsView(): ProductsView {
    return localStorage.getItem(STORAGE_KEY) === 'table' ? 'table' : 'grid';
}

export const ProductsViewContext = createContext<[ProductsView, (v: ProductsView) => void]>(['grid', noop]);

export function ProductsViewWrapper({ children }: React.PropsWithChildren) {
    const [productsView, setProductsView] = useState<ProductsView>(readInitialProductsView);

    const setAndPersist = useCallback((v: ProductsView) => {
        localStorage.setItem(STORAGE_KEY, v);
        setProductsView(v);
    }, []);

    return <ProductsViewContext value={[productsView, setAndPersist]}>{children}</ProductsViewContext>;
}

export const useProductsView = () => use(ProductsViewContext);
