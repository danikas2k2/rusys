import React, { createContext, useContext, useMemo } from 'react';

import type { Product } from '~/types/data';

interface VisibleProductsValue {
    products: readonly Product[];
    byGroup: Map<string, readonly Product[]>;
}

const VisibleProductsContext = createContext<VisibleProductsValue>({
    products: [],
    byGroup: new Map(),
});

export function VisibleProductsProvider({
    products,
    children,
}: React.PropsWithChildren<{
    products: readonly Product[];
}>) {
    const value = useMemo<VisibleProductsValue>(() => {
        const byGroup = products.reduce((map, product) => {
            const list = map.get(product.group);
            map.set(product.group, list ? [...list, product] : [product]);
            return map;
        }, new Map<string, readonly Product[]>());

        return { products, byGroup };
    }, [products]);

    return <VisibleProductsContext.Provider value={value}>{children}</VisibleProductsContext.Provider>;
}

export const useVisibleProducts = (): readonly Product[] => useContext(VisibleProductsContext).products;

export function useVisibleProductsByGroup(group: string): readonly Product[] {
    const { byGroup } = useContext(VisibleProductsContext);
    return useMemo(() => byGroup.get(group) ?? [], [byGroup, group]);
}
