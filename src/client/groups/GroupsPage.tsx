import React from 'react';

import { Page } from '~/client/common/Page';
import { GroupFilterContextWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterContextWrapper } from '~/client/filters/QuickFilterContext';
import { GroupsTable } from '~/client/groups/GroupsTable';

export function GroupsPage() {
    return (
        <Page>
            <GroupFilterContextWrapper>
                <QuickFilterContextWrapper>
                    <GroupsTable />
                </QuickFilterContextWrapper>
            </GroupFilterContextWrapper>
        </Page>
    );
}
