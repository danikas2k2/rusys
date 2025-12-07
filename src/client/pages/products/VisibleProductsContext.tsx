import React, { createContext, useContext, useMemo } from 'react';

import type { Product } from '~/types/data';

const VisibleProductsContext = createContext<readonly Product[]>([]);

export function VisibleProductsProvider({
    products,
    children,
}: React.PropsWithChildren<{
    products: readonly Product[];
}>) {
    return <VisibleProductsContext.Provider value={products}>{children}</VisibleProductsContext.Provider>;
}

export const useVisibleProducts = (): readonly Product[] => useContext(VisibleProductsContext);

export function useVisibleProductsByGroup(group: string): readonly Product[] {
    const products = useVisibleProducts();
    return useMemo(() => products.filter((product) => product.group === group), [group, products]);
}
