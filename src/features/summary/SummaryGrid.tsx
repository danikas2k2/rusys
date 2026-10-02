import { SimpleGrid } from '@mantine/core';
import React from 'react';

import { LoadableContent } from '~/components/common/LoadableContent';
import { useGroupFilter } from '~/features/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { useGetSummary } from '~/features/summary/hooks/useGetSummary';
import { useSummaryHasData } from '~/features/summary/hooks/useSummaryHasData';
import { useSummaryYears } from '~/features/summary/hooks/useSummaryYears';
import { SummaryTile } from '~/features/summary/SummaryTile';
import { getId } from '~/lib/utils/id';
import { useSummary } from '~/store/summary';

import './SummaryGrid.css';

const GRID_COLS = { base: 2, xs: 3, sm: 4, md: 5, lg: 6 };

export function SummaryGrid() {
    const [selectedGroup] = useGroupFilter();
    const summary = useSummary().filter(({ group }) => group === selectedGroup);
    const [fallbackYear = 0] = useSummaryYears();
    const quickFilter = useQuickFilterPredicate();

    return (
        <LoadableContent resourceKey="summary" loader={useGetSummary()} hasData={useSummaryHasData()}>
            <SimpleGrid data-grid="summary" cols={GRID_COLS} spacing="xs">
                {summary.map(({ name, years: amounts, image, photo }) => {
                    const year = amounts?.find(({ amounts: yearAmounts }) => yearAmounts.length)?.year ?? fallbackYear;
                    return (
                        <SummaryTile
                            key={getId(selectedGroup, name)}
                            group={selectedGroup}
                            name={name}
                            year={year}
                            amounts={amounts}
                            image={image}
                            photo={photo}
                            hidden={!quickFilter(name)}
                        />
                    );
                })}
            </SimpleGrid>
        </LoadableContent>
    );
}
