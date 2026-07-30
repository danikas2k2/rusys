import { Avatar, Group, Stack, Title } from '@mantine/core';
import React, { type ReactNode } from 'react';

interface AmountTitleProps {
    group?: string;
    name?: string;
    year?: ReactNode;
    image?: string;
}

export function AmountTitle({ group, name, year, image }: AmountTitleProps): React.JSX.Element {
    return (
        <Group gap="sm" wrap="nowrap">
            {image && <Avatar src={image} radius="md" size="lg" alt={name} />}
            <Stack gap={2} align="start">
                <Title order={4} fz="h2">
                    {name}
                </Title>
                <Title order={4} fz="lg">
                    {group}
                    {year != null && year !== 0 && year !== '' && <>, {year}</>}
                </Title>
            </Stack>
        </Group>
    );
}
