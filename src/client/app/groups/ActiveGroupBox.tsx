import React, { type JSX } from 'react';

import { useActiveRow } from '~/client/app/common/ActiveRowContext';
import { GroupBox } from '~/client/app/groups/dialogs/GroupBox';
import { type ActiveGroup } from '~/client/app/groups/SortableGroup';

export function ActiveGroupBox(): JSX.Element | null {
    const [activeGroup, setActiveGroup] = useActiveRow<ActiveGroup>();
    return activeGroup?.editing ? (
        <GroupBox group={activeGroup.group} annual={activeGroup.annual} onClose={() => setActiveGroup(undefined)} />
    ) : null;
}
