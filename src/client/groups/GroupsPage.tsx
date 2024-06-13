import React from 'react';
import { GroupsTable } from '~/client/groups/GroupsTable';
import { Label } from '~/client/common/Label';
import { Toolbar } from '~/client/toolbar/Toolbar';
import cx from './GroupsPage.less';

export function GroupsPage() {
    return (
        <div className={cx('GroupsPage')}>
            <Toolbar />
            <h1>
                <Label>Groups</Label>
            </h1>
            <GroupsTable />
        </div>
    );
}
