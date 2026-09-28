import { Stack } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';

import type { YearAmounts } from '~/common/data';
import { AnnotatedTotalAmounts } from '~/components/amounts/AnnotatedTotalAmounts';
import { GridTile } from '~/components/common/GridTile';
import { useSetActiveContent } from '~/components/runtime/ActiveContentContext';
import { type SummaryHistoryData } from '~/features/summary/SummaryAmounts';

import './SummaryTile.css';

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
        <GridTile
            name={name}
            tileKind="summary"
            image={image}
            photo={photo}
            onClick={handleClick}
            hidden={hidden}
            empty={isEmpty}
            fullHeading
            textShadow={!!image && !photo}
            amounts={
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
            }
            tileData={{ 'data-summary-tile': true, 'data-year': year }}
        />
    );
}
