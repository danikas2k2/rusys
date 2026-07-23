import React from 'react';

import { useAmountView } from '~/client/common/AmountViewContext';
import { DetailedAmounts } from '~/client/pages/products/DetailedAmounts';
import { TotalAmounts } from '~/client/pages/products/TotalAmounts';
import type { VariantAmount } from '~/types/data';

import './ProductAmounts.pcss';

export interface ProductAmountsProps {
    group: string;
    amounts?: readonly VariantAmount[];
    type?: 'common' | 'consumed' | 'recycled';
}

export function ProductAmounts({ group, amounts, type = 'common' }: ProductAmountsProps) {
    const [amountView] = useAmountView();

    if (!amounts?.length) {
        return null;
    }

    return (
        <span data-type={type}>
            {amountView === 'total' ? (
                <TotalAmounts group={group} amounts={amounts} />
            ) : (
                <DetailedAmounts group={group} amounts={amounts} />
            )}
        </span>
    );
}
