import React from 'react';

import { AmountSuffix } from '~/client/common/AmountSuffix';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import type { VariantAmount } from '~/types/data';

import './ProductAmounts.pcss';

export interface ProductAmountsProps {
    group: string;
    amounts?: readonly VariantAmount[];
    type?: 'consumed' | 'recycled';
}

export function ProductAmounts({ group, amounts, type }: ProductAmountsProps) {
    const compareVariants = useGroupVariantComparator(group);
    return amounts?.length ? (
        <span data-type={type}>
            {[...amounts]
                .sort((a, b) => compareVariants(a.variant, b.variant))
                .map((v) => (
                    <span key={v.variant} data-value>
                        {v.amount}
                        <AmountSuffix group={group} variant={v.variant} />
                    </span>
                ))}
        </span>
    ) : null;
}
