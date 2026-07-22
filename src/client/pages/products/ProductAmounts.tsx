import { IconAlertTriangle } from '@tabler/icons-react';
import React from 'react';

import { AmountSuffix } from '~/client/common/AmountSuffix';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import type { VariantAmount } from '~/types/data';

import './ProductAmounts.pcss';

export interface ProductAmountsProps {
    group: string;
    amounts?: readonly VariantAmount[];
    type?: 'common' | 'consumed' | 'recycled';
}

export function ProductAmounts({ group, amounts, type = 'common' }: ProductAmountsProps) {
    const compareVariants = useGroupVariantComparator(group);
    return amounts?.length ? (
        <span data-type={type}>
            {[...amounts]
                .sort(
                    (a, b) =>
                        compareVariants(a.variant, b.variant) ||
                        (!!a.suspicious === !!b.suspicious ? 0 : a.suspicious ? 1 : -1)
                )
                .map((v) => (
                    <span
                        key={`${v.variant}${v.suspicious ? '|s' : ''}`}
                        data-value
                        data-suspicious={v.suspicious || undefined}
                    >
                        {v.amount}
                        <AmountSuffix group={group} variant={v.variant} />
                        {v.suspicious && <IconAlertTriangle size={10} />}
                    </span>
                ))}
        </span>
    ) : null;
}
