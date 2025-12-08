import React from 'react';

import { ValueCell } from '~/client/pages/products/ValueCell';
import { useYears } from '~/client/state/years/useYears';
import type { Product } from '~/types/data';

interface ValueRowCellsProps {
    product: Product;
    annual?: boolean;
}

export function ValueRowCells({ product, annual = false }: ValueRowCellsProps) {
    const allYears = useYears();
    const lastYear = allYears.at(-1);

    return (
        <>
            {annual ? (
                allYears.map((year) => <ValueCell key={year} product={product} year={year} last={year === lastYear} />)
            ) : (
                <ValueCell product={product} span={allYears.length} />
            )}
        </>
    );
}
