import React, { useCallback } from 'react';

import { useActiveContent } from '~/components/runtime/ActiveContentContext';
import { ImportBox } from '~/features/dialogs/ImportBox';

export function ActiveImportBox() {
    const [active, setActive] = useActiveContent();

    const opened = active?.action === 'import';

    const handleClose = useCallback(() => setActive(), [setActive]);

    return <ImportBox opened={opened} onClose={handleClose} />;
}
