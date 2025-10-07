import React from 'react';

import { Page } from '~/client/app/common/Page';
import { QuickFilterContextWrapper } from '~/client/app/filters/QuickFilterContext';
import { GroupsTable } from '~/client/app/groups/GroupsTable';

export function GroupsPage() {
    return (
        <QuickFilterContextWrapper>
            <Page>
                <GroupsTable />
            </Page>
        </QuickFilterContextWrapper>
    );
}
