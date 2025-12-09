import React from 'react';

import { ProductCell } from '~/client/pages/products/ProductCell';
import { useYears } from '~/client/state/years/useYears';
import type { Product } from '~/types/data';

interface ProductCellsProps {
    product: Product;
    annual?: boolean;
}

export function ProductCells({ product, annual = false }: ProductCellsProps) {
    const allYears = useYears();
    const lastYear = allYears.at(-1);

    return (
        <>
            {annual ? (
                allYears.map((year) => (
                    <ProductCell key={year} product={product} year={year} last={year === lastYear} />
                ))
            ) : (
                <ProductCell product={product} span={allYears.length} />
            )}
        </>
    );
}
