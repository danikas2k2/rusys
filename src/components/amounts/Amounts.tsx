import React from 'react';

import type { VariantAmount } from '~/common/data';
import { useAmountView } from '~/components/amounts/AmountViewContext';
import { DetailedAmounts } from '~/components/amounts/DetailedAmounts';
import { TotalAmounts } from '~/components/amounts/TotalAmounts';

import './Amounts.css';

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
