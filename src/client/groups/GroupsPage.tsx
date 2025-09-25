import React from 'react';

import { Page } from '~/client/common/Page';
import { QuickFilterContextWrapper } from '~/client/filters/QuickFilterContext';
import { GroupsTable } from '~/client/groups/GroupsTable';

export function GroupsPage() {
    return (
        <QuickFilterContextWrapper>
            <Page>
                <GroupsTable />
            </Page>
        </QuickFilterContextWrapper>
    );
}
