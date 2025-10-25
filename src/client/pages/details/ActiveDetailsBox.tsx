import React, { type JSX } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { DetailsBox } from '~/client/pages/details/dialogs/DetailsBox';

export function ActiveDetailsBox(): JSX.Element | null {
    const [active, setActive] = useActiveContent();
    return active?.editing ? <DetailsBox {...active.data} onClose={() => setActive(undefined)} /> : null;
}
