import type { VariantAmount } from '@rusys/common/data';
import React from 'react';

import { useAmountView } from '~/components/amounts/AmountViewContext';
import { DetailedAmounts } from '~/components/amounts/DetailedAmounts';
import { TotalAmounts } from '~/components/amounts/TotalAmounts';

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
