import React from 'react';

import { ProductCell } from '~/client/pages/products/ProductCell';
import { useYears } from '~/client/state/years/useYears';
import type { Product } from '~/types/data';

interface ProductCellsProps {
    product: Product;
    annual?: boolean;
}

// Columns for years this old (or older) are marked as old/stale
const OLD_YEARS_THRESHOLD = 4;

export function ProductCells({ product, annual = false }: ProductCellsProps) {
    const allYears = useYears();
    const thisYear = new Date().getFullYear() % 100;

    return (
        <>
            {annual ? (
                allYears.map((year) => (
                    <ProductCell
                        key={year}
                        product={product}
                        year={year}
                        old={year <= thisYear - OLD_YEARS_THRESHOLD}
                    />
                ))
            ) : (
                <ProductCell product={product} span={allYears.length} />
            )}
        </>
    );
}
