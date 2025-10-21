import React from 'react';

import { Page } from '~/client/common/Page';
import { QuickFilterContextWrapper } from '~/client/filters/QuickFilterContext';
import { GroupBox } from '~/client/pages/groups/dialogs/GroupBox';
import { GroupsTable } from '~/client/pages/groups/GroupsTable';

export function GroupsPage() {
    return (
        <QuickFilterContextWrapper>
            <Page addBox={<GroupBox />}>
                <GroupsTable />
            </Page>
        </QuickFilterContextWrapper>
    );
}
