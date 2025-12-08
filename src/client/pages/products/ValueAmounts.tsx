import React, { memo } from 'react';

import { ValueSuffix } from '~/client/common/ValueSuffix';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import type { VariantAmount } from '~/types/data';

import './ValueAmounts.pcss';

export interface ValueAmountsProps {
    group: string;
    amounts?: readonly VariantAmount[];
}

function ValueAmountsContent({ group, amounts }: ValueAmountsProps) {
    const compareVariants = useGroupVariantComparator(group);
    return amounts?.length ? (
        <>
            {[...amounts]
                .sort((a, b) => compareVariants(a.variant, b.variant))
                .map((v) => (
                    <span key={v.variant} data-value>
                        {v.amount}
                        <ValueSuffix group={group} variant={v.variant} />
                    </span>
                ))}
        </>
    ) : null;
}

export const ValueAmounts = memo(ValueAmountsContent);
