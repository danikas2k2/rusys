import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { ImportBox } from '~/client/dialogs/ImportBox';

export function ActiveImportBox() {
    const [active, setActive] = useActiveContent();

    const opened = active?.action === 'import';

    const handleClose = useCallback(() => setActive(), [setActive]);

    return <ImportBox opened={opened} onClose={handleClose} />;
}
