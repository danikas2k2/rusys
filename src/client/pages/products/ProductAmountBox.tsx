import { Stack, Title } from '@mantine/core';
import React from 'react';

import { AmountBox } from '~/client/pages/common/AmountBox';
import type { ProductAmounts, VariantAmount } from '~/types/data';

import './ProductAmountBox.pcss';

export interface AmountBoxProps extends ProductAmounts {
    opened?: boolean;
    onClose?: (changes?: readonly VariantAmount[]) => void;
    onAfterClose?: () => void;
}

export function ProductAmountBox({
    opened = false,
    group,
    name,
    year,
    amounts,
    onClose,
    onAfterClose,
}: AmountBoxProps) {
    return (
        <AmountBox
            opened={opened}
            group={group}
            amounts={amounts}
            onClose={onClose}
            onAfterClose={onAfterClose}
            title={
                <Stack gap={2}>
                    <Title order={4} fz="h2">
                        {name}
                    </Title>
                    <Title order={4} fz="lg">
                        {group}
                        {!!year && `, ${year}`}
                    </Title>
                </Stack>
            }
        />
    );
}
