import React, { memo } from 'react';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { ValueRowCells } from '~/client/pages/products/ValueRowCells';
import { ValueRowTitle } from '~/client/pages/products/ValueRowTitle';
import { SwipeableRow } from '~/client/table/SwipeableRow';
import type { Product } from '~/types/data';

import './ValueRow.pcss';

export interface ValueRowProps {
    product: Product;
    annual?: boolean;
    hidden?: boolean;
}

function ValueRowComponent({ product, annual = true, hidden = false }: ValueRowProps) {
    const namePredicate = useQuickFilterPredicate();
    const groupPredicate = useGroupFilterPredicate();

    return (
        <SwipeableRow
            id={`${product.group}:${product.name}`}
            data={{ group: product.group, name: product.name }}
            data-group={product.group}
            data-hidden={hidden || !namePredicate(product.name) || !groupPredicate(product.group)}
        >
            <ValueRowTitle product={product} />
            <ValueRowCells product={product} annual={annual} />
        </SwipeableRow>
    );
}

export const ValueRow = memo(ValueRowComponent);
