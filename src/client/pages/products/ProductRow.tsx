import React from 'react';

import { ProductCells } from '~/client/pages/products/ProductCells';
import { ProductTitle } from '~/client/pages/products/ProductTitle';
import { SwipeableRow } from '~/client/table/SwipeableRow';
import { getId } from '~/client/utils/id';
import type { Product, YearAmounts } from '~/types/data';

export interface ProductRowProps {
    product: Product;
    annual?: boolean;
    hidden?: boolean;
    depth?: number;
    hasChildren?: boolean;
    expanded?: boolean;
    onToggleExpand?: () => void;
    rolledUpYears?: readonly YearAmounts[];
}

export function ProductRow({
    product,
    annual = true,
    hidden = false,
    depth = 0,
    hasChildren = false,
    expanded = false,
    onToggleExpand,
    rolledUpYears,
}: ProductRowProps) {
    return (
        <SwipeableRow
            id={getId(product.group, product.name)}
            data={product}
            data-group={product.group}
            data-hidden={hidden}
        >
            <ProductTitle
                product={product}
                depth={depth}
                hasChildren={hasChildren}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
            />
            <ProductCells
                product={product}
                annual={annual}
                rolledUpYears={rolledUpYears}
                hasChildren={hasChildren}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
            />
        </SwipeableRow>
    );
}
