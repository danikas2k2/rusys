import React from 'react';

import { ProductCell } from '~/client/pages/products/ProductCell';
import { useYears } from '~/client/state/years/useYears';
import { getCombinedAmounts } from '~/common/utils/amounts';
import type { Product, YearAmounts } from '~/types/data';

interface ProductCellsProps {
    product: Product;
    annual?: boolean;
    rolledUpYears?: readonly YearAmounts[];
    hasChildren?: boolean;
    expanded?: boolean;
    onToggleExpand?: () => void;
}

// Columns for years this old (or older) are marked as old/stale
export const OLD_YEARS_THRESHOLD = 4;

export function ProductCells({
    product,
    annual = false,
    rolledUpYears,
    hasChildren = false,
    expanded = false,
    onToggleExpand,
}: ProductCellsProps) {
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
                        displayAmounts={rolledUpYears?.find((y) => y.year === year)?.amounts}
                        hasChildren={hasChildren}
                        expanded={expanded}
                        onToggleExpand={onToggleExpand}
                    />
                ))
            ) : (
                <ProductCell
                    product={product}
                    displayAmounts={rolledUpYears && getCombinedAmounts(rolledUpYears)}
                    hasChildren={hasChildren}
                    expanded={expanded}
                    onToggleExpand={onToggleExpand}
                />
            )}
        </>
    );
}
