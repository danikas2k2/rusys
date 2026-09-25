import { Avatar, Group, Stack, Title } from '@mantine/core';
import React from 'react';

interface AmountTitleProps {
    group?: string;
    name?: string;
    image?: string;
    photo?: string;
}

export function AmountTitle({ group, name, image, photo }: AmountTitleProps): React.JSX.Element {
    return (
        <Group gap="sm" wrap="nowrap">
            {image && !photo && (
                <Avatar src={image} radius="md" size="lg" alt={name}>
                    {name?.trim().charAt(0).toUpperCase()}
                </Avatar>
            )}
            <Stack gap={8} align="start">
                <Title order={1} lh={1}>
                    {name}
                </Title>
                <Title order={4} lh={1}>
                    {group}
                </Title>
            </Stack>
        </Group>
    );
}
