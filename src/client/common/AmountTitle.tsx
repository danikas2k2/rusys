import { Stack, Title } from '@mantine/core';
import React, { type ReactNode } from 'react';

interface AmountTitleProps {
    group?: string;
    name?: string;
    year?: ReactNode;
}

export function AmountTitle({ group, name, year }: AmountTitleProps): React.JSX.Element {
    return (
        <Stack gap={2}>
            <Title order={4} fz="h2">
                {name}
            </Title>
            <Title order={4} fz="lg">
                {group}
                {year != null && year !== 0 && year !== '' && <>, {year}</>}
            </Title>
        </Stack>
    );
}
