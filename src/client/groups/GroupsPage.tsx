import React from 'react';
import { Page } from '~/client/common/Page';
import { GroupsTable } from '~/client/groups/GroupsTable';

export function GroupsPage() {
    return (
        <Page>
            <GroupsTable />
        </Page>
    );
}
