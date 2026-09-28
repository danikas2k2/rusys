import { Card, Group, Stack, Text } from '@mantine/core';
import React from 'react';

import './GridTile.css';

interface GridTileProps {
    name: string;
    tileKind: 'product' | 'summary';
    image?: string;
    photo?: string;
    hidden?: boolean;
    empty?: boolean;
    onClick?: () => void;
    leading?: React.ReactNode;
    headingAction?: React.ReactNode;
    amounts?: React.ReactNode;
    overlay?: React.ReactNode;
    fullHeading?: boolean;
    textShadow?: boolean;
    tileData?: Record<string, boolean | string | number | undefined>;
}

export function GridTile({
    name,
    tileKind,
    image,
    photo,
    hidden = false,
    empty = false,
    onClick,
    leading,
    headingAction,
    amounts,
    overlay,
    fullHeading = false,
    textShadow = !!image || !!photo,
    tileData,
}: GridTileProps) {
    const isPhoto = !!photo;
    const isIcon = !!image && !isPhoto;

    return (
        <Card
            withBorder
            padding="sm"
            radius="md"
            onClick={onClick}
            data-tile={tileKind}
            data-hidden={hidden}
            data-photo={isPhoto}
            data-empty={empty}
            data-full-heading={fullHeading || undefined}
            {...tileData}
        >
            {isPhoto && (
                <>
                    <div data-photo-bg style={{ backgroundImage: `url(${photo})` }} />
                    <div data-scrim />
                </>
            )}
            {isIcon && <div data-icon-bg style={{ backgroundImage: `url(${image})` }} />}
            <Stack gap={6} data-content h="100%">
                {leading ?? <span data-tile-icon />}
                <Group data-tile-heading justify="space-between" wrap="nowrap" gap={6} align="flex-start">
                    <Text
                        data-text-shaddow={textShadow}
                        lh={fullHeading ? 'xs' : 1}
                        lineClamp={2}
                        p={fullHeading ? undefined : '4 2'}
                        style={{ flex: 1, minWidth: 0 }}
                    >
                        {name}
                    </Text>
                    {headingAction}
                </Group>
                {amounts && (
                    <Group data-tile-amounts data-text-shaddow={textShadow} justify="flex-end" lh="xs">
                        {amounts}
                    </Group>
                )}
            </Stack>
            {overlay}
        </Card>
    );
}
