import React, { type JSX } from 'react';

import { useActiveRow } from '~/client/common/ActiveRowContext';
import { VariantBox } from '~/client/pages/variants/dialogs/VariantBox';
import { type ActiveVariant } from '~/client/pages/variants/SortableVariant';

export function ActiveVariantBox(): JSX.Element | null {
    const [activeVariant, setActiveVariant] = useActiveRow<ActiveVariant>();
    return activeVariant?.editing ? (
        <VariantBox
            group={activeVariant.group}
            variant={activeVariant.variant}
            onClose={() => setActiveVariant(undefined)}
        />
    ) : null;
}
