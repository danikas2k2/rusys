import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { ActiveContentOutsideClick } from '~/client/common/ActiveContentOutsideClick';
import { Page } from '~/client/common/Page';
import { SwipeControls } from '~/client/common/SwipeControls';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { QuickFilterContextWrapper } from '~/client/filters/QuickFilterContext';
import { ActiveGroupBox } from '~/client/pages/groups/ActiveGroupBox';
import { GroupsTable } from '~/client/pages/groups/GroupsTable';
import { useDeleteGroup } from '~/client/state/groups/useDeleteGroup';
import type { Group } from '~/types/data';

export function GroupsPage() {
    const [, setActive] = useActiveContent<Pick<Group, 'group'>>();

    const handleAdd = useCallback(() => setActive({ id: '#', editing: true }), [setActive]);

    const deleteGroup = useDeleteGroup();
    const handleDelete = ({ group }: Group) => deleteGroup(group);

    return (
        <QuickFilterContextWrapper>
            <Page onAdd={handleAdd}>
                <SwipeControlsWrapper>
                    <GroupsTable />
                    <SwipeControls onDelete={handleDelete} />
                </SwipeControlsWrapper>
                <ActiveGroupBox />
                <ActiveContentOutsideClick />
            </Page>
        </QuickFilterContextWrapper>
    );
}
