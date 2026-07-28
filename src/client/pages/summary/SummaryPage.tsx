import React from 'react';

import { ActiveContentWrapper } from '~/client/common/ActiveContentContext';
import { CategoryRailLayout } from '~/client/filters/CategoryRailLayout';
import { Page } from '~/client/pages/common/Page';
import { ActiveHistoryBox } from '~/client/pages/summary/ActiveHistoryBox';
import { useGroupsWithSummary } from '~/client/pages/summary/hooks/useGroupsWithSummary';
import { SummaryTable } from '~/client/pages/summary/SummaryTable';

export function SummaryPage() {
    const groupsWithSummary = useGroupsWithSummary();

    return (
        <Page>
            <CategoryRailLayout groupsWithContent={groupsWithSummary}>
                <ActiveContentWrapper>
                    <SummaryTable />
                    <ActiveHistoryBox />
                </ActiveContentWrapper>
            </CategoryRailLayout>
        </Page>
    );
}
