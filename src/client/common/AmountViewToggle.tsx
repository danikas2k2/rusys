import { SegmentedControl, ThemeIcon } from '@mantine/core';
import { IconIcons, IconScale } from '@tabler/icons-react';
import React from 'react';

import { useAmountView, type AmountView } from '~/client/common/AmountViewContext';
import { useLabels } from '~/client/hooks/useLabels';

export function AmountViewToggle() {
    const _ = useLabels();
    const [amountView, setAmountView] = useAmountView();

    const data = [
        {
            value: 'total',
            label: (
                <ThemeIcon color="text" variant={amountView === 'total' ? 'filled' : 'subtle'}>
                    <IconScale size={22} aria-label={_('Total quantity')} />
                </ThemeIcon>
            ),
        },
        {
            value: 'detailed',
            label: (
                <ThemeIcon color="text" variant={amountView === 'detailed' ? 'filled' : 'subtle'}>
                    <IconIcons size={22} aria-label={_('Detailed')} />
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
