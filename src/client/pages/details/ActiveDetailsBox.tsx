import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { DetailsBox } from '~/client/pages/details/DetailsBox';
import type { Details } from '~/types/data';

export function ActiveDetailsBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<Details>();

    const opened = active?.action === 'update';

    const handleClose = useCallback(() => setActive({ data: active?.data }), [active?.data, setActive]);

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    return <DetailsBox opened={opened} {...active?.data} onClose={handleClose} onAfterClose={handleAfterClose} />;
}
