import React, { useCallback, useEffect } from 'react';

import { Table } from '@mantine/core';

import { LoadableContent } from '~/client/common/LoadableContent';
import { useDetailsFilters } from '~/client/filters/hooks/useDetailsFilters';
import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useQuickFilterContext } from '~/client/filters/QuickFilterContext';
import { useSortedList } from '~/client/hooks/useSortedList';
import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';
import { DetailsGroups } from '~/client/pages/details/DetailsGroups';
import { useDetailsHasData } from '~/client/pages/details/hooks/useDetailsHasData';
import { useMissingDetails } from '~/client/pages/details/hooks/useMissingDetails';
import { MissingOnlyCheckbox } from '~/client/pages/details/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/pages/details/MissingOnlyContext';
import { useDetails } from '~/client/state/details/useDetails';
import { useGetDetails } from '~/client/state/details/useGetDetails';
import { useYears } from '~/client/state/years/useYears';

export function DetailsTable() {
    const filteredDetails = useFilteredList(useDetails(), useDetailsFilters());
    const hasFilteredDetails = !!filteredDetails.length;

    const [missingOnly, setMissingOnly] = useMissingOnly();
    const missingDetails = useMissingDetails(filteredDetails);
    const hasMissingDetails = !!missingDetails.length;

    useEffect(() => {
        if (missingOnly && !hasMissingDetails && hasFilteredDetails) {
            setMissingOnly(false);
        }
    }, [hasFilteredDetails, hasMissingDetails, missingOnly, setMissingOnly]);

    const [filter, setFilter] = useQuickFilterContext();
    const handleClick = useCallback(() => {
        if (missingOnly && filter && !hasMissingDetails) {
            setFilter('');
        }
    }, [filter, hasMissingDetails, missingOnly, setFilter]);

    const visibleDetails = useSortedList(missingOnly ? missingDetails : filteredDetails);
    const uniqueGroups = useUniqueGroups(visibleDetails);
    const group = useGroupFilter();
    const visibleGroups = group ? [group] : uniqueGroups;
    const years = useYears();
    const headingWidth = 300 / (years.length + 3);

    return (
        <LoadableContent loader={useGetDetails()} hasData={useDetailsHasData()}>
            <Table layout="fixed">
                <Table.Thead>
                    <Table.Tr h="3rem">
                        <Table.Th w={`${headingWidth}%`}>
                            <MissingOnlyCheckbox onClick={handleClick} />
                        </Table.Th>
                        {years.map((year) => (
                            <Table.Th key={year} ta="center">
                                {year}
                            </Table.Th>
                        ))}
                    </Table.Tr>
                </Table.Thead>
                <DetailsGroups groups={visibleGroups} details={visibleDetails} />
            </Table>
        </LoadableContent>
    );
}
