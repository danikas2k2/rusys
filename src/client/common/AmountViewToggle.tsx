import { SegmentedControl, ThemeIcon } from '@mantine/core';
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
                <ThemeIcon color="text" c="text" variant="subtle">
                    <TotalAmountViewIcon size={22} aria-label={_('Total quantity')} />
                </ThemeIcon>
            ),
        },
        {
            value: 'detailed',
            label: (
                <ThemeIcon color="text" c="text" variant="subtle">
                    <DetailedAmountViewIcon size={22} aria-label={_('Detailed')} />
                </ThemeIcon>
            ),
        },
    ];

    const handleChange = (value: string) => setAmountView(value as AmountView);

    return (
        <SegmentedControl
            data-toggle="amount-view"
            size="xs"
            p={0}
            data={data}
            value={amountView}
            onChange={handleChange}
        />
    );
}
