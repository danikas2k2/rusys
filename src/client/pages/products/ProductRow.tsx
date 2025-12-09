import React from 'react';

import { ProductCells } from '~/client/pages/products/ProductCells';
import { ProductTitle } from '~/client/pages/products/ProductTitle';
import { SwipeableRow } from '~/client/table/SwipeableRow';
import { getId } from '~/client/utils/id';
import type { Product } from '~/types/data';

export interface ProductRowProps {
    product: Product;
    annual?: boolean;
    hidden?: boolean;
}

export function ProductRow({ product, annual = true, hidden = false }: ProductRowProps) {
    return (
        <SwipeableRow
            id={getId(product.group, product.name)}
            data={{ group: product.group, name: product.name }}
            data-group={product.group}
            data-hidden={hidden}
        >
            <ProductTitle product={product} />
            <ProductCells product={product} annual={annual} />
        </SwipeableRow>
    );
}
