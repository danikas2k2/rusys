import { SimpleGrid } from '@mantine/core';
import React from 'react';

import { LoadableContent } from '~/client/common/LoadableContent';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useSummaryHasData } from '~/client/pages/summary/hooks/useSummaryHasData';
import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryTile } from '~/client/pages/summary/SummaryTile';
import { useGetSummary } from '~/client/state/summary/useGetSummary';
import { useSummary } from '~/client/state/summary/useSummary';
import { getId } from '~/client/utils/id';

import './SummaryGrid.pcss';

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
