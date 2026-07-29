import { Center, SegmentedControl } from '@mantine/core';
import React from 'react';

import { DetailedAmountViewIcon, TotalAmountViewIcon } from '@icons';

import { useAmountView, type AmountView } from '~/client/common/AmountViewContext';
import { useLabels } from '~/client/hooks/useLabels';

export function AmountViewToggle() {
    const _ = useLabels();
    const [amountView, setAmountView] = useAmountView();

    const data = [
        {
            value: 'total',
            label: (
                <Center>
                    <TotalAmountViewIcon size={20} aria-label={_('Total quantity')} />
                </Center>
            ),
        },
        {
            value: 'detailed',
            label: (
                <Center>
                    <DetailedAmountViewIcon size={20} aria-label={_('Detailed')} />
                </Center>
            ),
        },
    ];

    const handleChange = (value: string) => setAmountView(value as AmountView);

    return (
        <SegmentedControl
            data-toggle="amount-view"
            size="xs"
            color="primary"
            p="4 1"
            data={data}
            value={amountView}
            onChange={handleChange}
        />
    );
}
