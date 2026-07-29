import React from 'react';

import { ActiveContentWrapper } from '~/client/common/ActiveContentContext';
import { CategoryRailLayout } from '~/client/filters/CategoryRailLayout';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { Page } from '~/client/pages/common/Page';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { ActiveHistoryBox } from '~/client/pages/summary/ActiveHistoryBox';
import { useGroupsWithSummary } from '~/client/pages/summary/hooks/useGroupsWithSummary';
import { SummaryTable } from '~/client/pages/summary/SummaryTable';

export function SummaryPage() {
    const groupsWithSummary = useGroupsWithSummary();
    const groups = useSortedGroups().filter((g) => groupsWithSummary.has(g.group));
    const [selectedGroup, setSelectedGroup] = useGroupFilter();

    return (
        <Page>
            <CategoryRailLayout
                groups={groups}
                selected={selectedGroup}
                onSelect={setSelectedGroup}
                groupsWithContent={groupsWithSummary}
            >
                <ActiveContentWrapper>
                    <SummaryTable />
                    <ActiveHistoryBox />
                </ActiveContentWrapper>
            </CategoryRailLayout>
        </Page>
    );
}
