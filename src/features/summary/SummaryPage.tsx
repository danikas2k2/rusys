import React from 'react';

import { ActiveContentWrapper } from '~/components/runtime/ActiveContentContext';
import { Page } from '~/features/common/Page';
import { CategoryRailLayout } from '~/features/filters/CategoryRailLayout';
import { useGroupFilter } from '~/features/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { useSortedGroups } from '~/features/groups/hooks/useSortedGroups';
import { ActiveHistoryBox } from '~/features/summary/ActiveHistoryBox';
import { useGroupsWithSummary } from '~/features/summary/hooks/useGroupsWithSummary';
import { SummaryGrid } from '~/features/summary/SummaryGrid';

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
