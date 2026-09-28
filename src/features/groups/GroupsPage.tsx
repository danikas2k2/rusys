import React from 'react';

import { Page } from '~/features/common/Page';
import { QuickFilterWrapper } from '~/features/filters/QuickFilterContext';
import { ActiveGroupBox } from '~/features/groups/ActiveGroupBox';
import { GroupsTable } from '~/features/groups/GroupsTable';

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
