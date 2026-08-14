import React from 'react';

import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';
import { Page } from '~/client/pages/common/Page';
import { ActiveGroupBox } from '~/client/pages/groups/ActiveGroupBox';
import { GroupsTable } from '~/client/pages/groups/GroupsTable';

export function GroupsPage() {
    return (
        <QuickFilterWrapper>
            <Page withAdd>
                <GroupsTable />
                <ActiveGroupBox />
            </Page>
        </QuickFilterWrapper>
    );
}
