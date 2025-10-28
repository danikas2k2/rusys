import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { VariantBox } from '~/client/pages/variants/VariantBox';
import type { Variant } from '~/types/data';

export function ActiveVariantBox() {
    const [active, setActive] = useActiveContent<Variant>();

    const opened = active?.action === 'update';

    const handleClose = useCallback(() => setActive({ data: active?.data }), [active?.data, setActive]);

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    return <VariantBox opened={opened} {...active?.data} onClose={handleClose} onAfterClose={handleAfterClose} />;
}
