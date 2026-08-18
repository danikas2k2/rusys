import { Card, Group, Stack, Text } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { AnnotatedTotalAmounts } from '~/client/pages/products/AnnotatedTotalAmounts';
import { type SummaryHistoryData } from '~/client/pages/summary/SummaryCell';
import type { YearAmounts } from '~/types/data';

import '~/client/pages/products/ProductTile.pcss';
import './SummaryTile.pcss';

interface SummaryTileProps {
    group: string;
    name: string;
    year: number;
    amounts?: readonly YearAmounts[];
    image?: string;
    photo?: string;
    hidden?: boolean;
}

export function SummaryTile({ group, name, year, amounts, image, photo, hidden = false }: SummaryTileProps) {
    const setActive = useSetActiveContent<SummaryHistoryData>();
    const yearAmounts = amounts?.find((item) => item.year === year)?.amounts;
    const isPhoto = !!photo;
    const isIcon = !!image && !isPhoto;
    const consumed = useMemo(() => yearAmounts?.filter((amount) => amount.recycled === false) ?? [], [yearAmounts]);
    const recycled = useMemo(() => yearAmounts?.filter((amount) => amount.recycled === true) ?? [], [yearAmounts]);
    const isEmpty = !consumed.length && !recycled.length;

    const handleClick = useCallback(() => {
        setActive({
            action: 'history',
            data: { group, name, year, amounts: yearAmounts ?? [], image, photo },
        });
    }, [setActive, group, name, year, yearAmounts, image, photo]);

    return (
        <Card
            withBorder
            padding="sm"
            radius="md"
            onClick={handleClick}
            data-tile="product"
            data-summary-tile
            data-year={year}
            data-hidden={hidden}
            data-photo={isPhoto}
            data-empty={isEmpty}
        >
            {isPhoto && (
                <>
                    <div data-photo-bg style={{ backgroundImage: `url(${photo})` }} />
                    <div data-scrim />
                </>
            )}
            {isIcon && <div data-icon-bg style={{ backgroundImage: `url(${image})` }} />}
            <Stack gap={6} data-content h="100%">
                <span data-tile-icon />
                <Group data-tile-heading justify="space-between" wrap="nowrap" gap={6} align="flex-start">
                    <Text data-text-shaddow={isIcon} lh="xs" lineClamp={2} style={{ flex: 1, minWidth: 0 }}>
                        {name}
                    </Text>
                </Group>
                <Group data-tile-amounts data-text-shaddow={isIcon} justify="flex-end" lh="xs">
                    <Stack gap={2} align="flex-end">
                        {consumed.length > 0 && (
                            <span data-type="consumed">
                                <AnnotatedTotalAmounts group={group} amounts={consumed} />
                            </span>
                        )}
                        {recycled.length > 0 && (
                            <span data-type="recycled">
                                <AnnotatedTotalAmounts group={group} amounts={recycled} />
                            </span>
                        )}
                    </Stack>
                </Group>
            </Stack>
        </Card>
    );
}
