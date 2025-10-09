import React, { type JSX } from 'react';

import { useActiveRow } from '~/client/common/ActiveRowContext';
import { VariantBox } from '~/client/variants/dialogs/VariantBox';
import { type ActiveVariant } from '~/client/variants/SortableVariant';

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
