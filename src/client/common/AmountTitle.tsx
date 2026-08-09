import { Avatar, Group, Stack, Title } from '@mantine/core';
import React, { type ReactNode } from 'react';

interface AmountTitleProps {
    group?: string;
    name?: string;
    year?: ReactNode;
    image?: string;
    // Present only when `image` qualifies as a photo - in that case the dialog's own background
    // watermark already shows it (see ProductDialogIcon/AmountBox), so this icon steps aside
    // rather than showing the same picture twice.
    photo?: string;
}

export function AmountTitle({ group, name, year, image, photo }: AmountTitleProps): React.JSX.Element {
    return (
        <Group gap="sm" wrap="nowrap">
            {image && !photo && (
                // If the image fails to load, Mantine will render children as fallback.
                <Avatar src={image} radius="md" size="lg" alt={name}>
                    {name?.trim().charAt(0).toUpperCase()}
                </Avatar>
            )}
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
