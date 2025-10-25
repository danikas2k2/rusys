import React, { useCallback, type JSX } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { VariantBox } from '~/client/pages/variants/dialogs/VariantBox';

export function ActiveVariantBox(): JSX.Element | null {
    const [active, setActive] = useActiveContent();
    const handleClose = useCallback(() => setActive(undefined), [setActive]);
    return active?.editing ? <VariantBox {...active.data} onClose={handleClose} /> : null;
}
