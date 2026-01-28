import React from 'react';

import { SwipeControls } from '~/client/common/SwipeControls';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';
import { Page } from '~/client/pages/common/Page';
import { ActiveGroupBox } from '~/client/pages/groups/ActiveGroupBox';
import { GroupsTable } from '~/client/pages/groups/GroupsTable';
import { useDeleteGroup } from '~/client/state/groups/useDeleteGroup';
import type { Group } from '~/types/data';

export function GroupsPage() {
    const deleteGroup = useDeleteGroup();
    const handleDelete = ({ group }: Group) => deleteGroup(group);

    return (
        <QuickFilterWrapper paramName="qg">
            <Page withAdd onDelete={handleDelete}>
                <SwipeControlsWrapper>
                    <GroupsTable />
                    <SwipeControls />
                </SwipeControlsWrapper>
                <ActiveGroupBox />
            </Page>
        </QuickFilterWrapper>
    );
}
