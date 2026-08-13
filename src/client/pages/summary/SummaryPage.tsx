import { Group } from '@mantine/core';
import React from 'react';

import { ActiveContentWrapper } from '~/client/common/ActiveContentContext';
import { ProductsViewWrapper, useProductsView } from '~/client/common/ProductsViewContext';
import { ProductsViewToggle } from '~/client/common/ProductsViewToggle';
import { CategoryRailLayout } from '~/client/filters/CategoryRailLayout';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { Page } from '~/client/pages/common/Page';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { ActiveHistoryBox } from '~/client/pages/summary/ActiveHistoryBox';
import { useGroupsWithSummary } from '~/client/pages/summary/hooks/useGroupsWithSummary';
import { SummaryGrid } from '~/client/pages/summary/SummaryGrid';
import { SummaryTable } from '~/client/pages/summary/SummaryTable';

import './SummaryPage.pcss';

export function SummaryPage() {
    return (
        <ProductsViewWrapper>
            <SummaryPageContent />
        </ProductsViewWrapper>
    );
}

function SummaryPageContent() {
    const groupsWithSummary = useGroupsWithSummary();
    const groupsWithFilteredSummary = useGroupsWithSummary(useQuickFilterPredicate());
    const groups = useSortedGroups().filter((g) => groupsWithSummary.has(g.group));
    const [selectedGroup, setSelectedGroup] = useGroupFilter();
    const [view] = useProductsView();

    return (
        <Page alignToolbarWithCategoryRail>
            <CategoryRailLayout
                groups={groups}
                selected={selectedGroup}
                onSelect={setSelectedGroup}
                groupsWithContent={groupsWithFilteredSummary}
            >
                <ActiveContentWrapper>
                    <Group data-summary-header data-view={view} justify="flex-end" wrap="nowrap" mb="sm">
                        <ProductsViewToggle />
                    </Group>
                    {view === 'grid' ? <SummaryGrid /> : <SummaryTable />}
                    <ActiveHistoryBox />
                </ActiveContentWrapper>
            </CategoryRailLayout>
        </Page>
    );
}
