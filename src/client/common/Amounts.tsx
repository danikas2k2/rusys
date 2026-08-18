import React from 'react';

import { useAmountView } from '~/client/common/AmountViewContext';
import { DetailedAmounts } from '~/client/common/DetailedAmounts';
import { TotalAmounts } from '~/client/common/TotalAmounts';
import type { VariantAmount } from '~/types/data';

import './Amounts.pcss';

export function Amounts({
    group,
    amounts,
    type = 'common',
}: {
    group: string;
    amounts?: readonly VariantAmount[];
    type?: 'common' | 'consumed' | 'recycled';
}) {
    const [amountView] = useAmountView();
    if (!amounts?.length) return null;
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
