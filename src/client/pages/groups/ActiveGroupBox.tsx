import React, { type JSX } from 'react';

import { useActiveRow } from '~/client/common/ActiveRowContext';
import { GroupBox } from '~/client/pages/groups/dialogs/GroupBox';
import { type ActiveGroup } from '~/client/pages/groups/SortableGroup';

export function ActiveGroupBox(): JSX.Element | null {
    const [activeGroup, setActiveGroup] = useActiveRow<ActiveGroup>();
    return activeGroup?.editing ? (
        <GroupBox group={activeGroup.group} annual={activeGroup.annual} onClose={() => setActiveGroup(undefined)} />
    ) : null;
}
