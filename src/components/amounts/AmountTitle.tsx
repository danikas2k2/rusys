import { Group, Stack, Title } from '@mantine/core';
import React from 'react';

import { Thumbnail } from '~/components/common/Thumbnail';

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
                <Thumbnail src={image} alt={name ?? ''} fallback={name?.trim().charAt(0).toUpperCase() ?? ''} />
            )}
            <Stack gap={8} align="start">
                <Title order={1} lh={1}>
                    {name}
                </Title>
                <Title order={3} lh={1}>
                    {group}
                </Title>
            </Stack>
        </Group>
    );
}
