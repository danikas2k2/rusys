import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { GroupBox } from '~/client/pages/groups/dialogs/GroupBox';
import { type Group } from '~/types/data';

export function ActiveGroupBox(): React.JSX.Element | null {
    const [active, setActive] = useActiveContent<Pick<Group, 'group'>>();

    const handleClose = useCallback(() => setActive(undefined), [setActive]);

    return active?.editing ? <GroupBox {...active.data} onClose={handleClose} /> : null;
}
