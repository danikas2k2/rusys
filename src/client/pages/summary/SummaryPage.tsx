import React from 'react';

import { ActiveContentWrapper } from '~/client/common/ActiveContentContext';
import { CategoryRailLayout } from '~/client/filters/CategoryRailLayout';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { Page } from '~/client/pages/common/Page';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { ActiveHistoryBox } from '~/client/pages/summary/ActiveHistoryBox';
import { useGroupsWithSummary } from '~/client/pages/summary/hooks/useGroupsWithSummary';
import { SummaryGrid } from '~/client/pages/summary/SummaryGrid';

export function SummaryPage() {
    return <SummaryPageContent />;
}

function SummaryPageContent() {
    const groupsWithSummary = useGroupsWithSummary();
    const groupsWithFilteredSummary = useGroupsWithSummary(useQuickFilterPredicate());
    const groups = useSortedGroups().filter((g) => groupsWithSummary.has(g.group));
    const [selectedGroup, setSelectedGroup] = useGroupFilter();

    return (
        <Page alignToolbarWithCategoryRail>
            <CategoryRailLayout
                groups={groups}
                selected={selectedGroup}
                onSelect={setSelectedGroup}
                groupsWithContent={groupsWithFilteredSummary}
            >
                <ActiveContentWrapper>
                    <SummaryGrid />
                    <ActiveHistoryBox />
                </ActiveContentWrapper>
            </CategoryRailLayout>
        </Page>
    );
}
