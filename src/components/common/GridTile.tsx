import { Card, Group, Stack, Text } from '@mantine/core';
import Image from 'next/image';
import React from 'react';

import { localImageLoader } from '~/lib/utils/localImageLoader';

import './GridTile.css';

interface GridTileProps {
    name: string;
    tileKind: 'product' | 'summary';
    image?: string;
    photo?: string;
    imageLoading?: 'eager' | 'lazy';
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
    imageLoading = 'lazy',
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
                    <Image
                        data-photo-bg
                        src={photo}
                        alt=""
                        width={320}
                        height={240}
                        loading={imageLoading}
                        loader={photo.startsWith('/images/') ? localImageLoader : undefined}
                        unoptimized={photo.includes('://') || photo.startsWith('data:')}
                    />
                    <div data-scrim />
                </>
            )}
            {isIcon && (
                <Image
                    data-icon-bg
                    src={image}
                    alt=""
                    width={80}
                    height={80}
                    loading={imageLoading}
                    loader={image.startsWith('/images/') ? localImageLoader : undefined}
                    unoptimized={image.includes('://') || image.startsWith('data:')}
                />
            )}
            <Stack gap={6} data-content h="100%">
                {leading ?? <span data-tile-icon />}
                <Group data-tile-heading justify="space-between" wrap="nowrap" gap={6} align="flex-start">
                    <Text
                        data-text-shadow={textShadow}
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
                    <Group data-tile-amounts data-text-shadow={textShadow} justify="flex-end" lh="xs">
                        {amounts}
                    </Group>
                )}
            </Stack>
            {overlay}
        </Card>
    );
}
