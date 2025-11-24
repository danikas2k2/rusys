import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { GroupBox } from '~/client/pages/groups/GroupBox';
import type { Group } from '~/types/data';

export function ActiveGroupBox() {
    const [active, setActive] = useActiveContent<Group>();

    const opened = active?.action === 'update';

    const handleClose = useCallback(() => setActive({ data: active?.data }), [active?.data, setActive]);

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    return <GroupBox opened={opened} {...active?.data} onClose={handleClose} onAfterClose={handleAfterClose} />;
}
