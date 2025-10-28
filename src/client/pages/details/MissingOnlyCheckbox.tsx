import React, { useCallback } from 'react';

import { Checkbox } from '@mantine/core';

import { useMissingOnly } from '~/client/pages/details/MissingOnlyContext';
import { useHasMissing } from '~/client/state/details/useHasMissing';

export function MissingOnlyCheckbox({ onClick }: { onClick?: () => void }) {
    const hasMissing = useHasMissing();
    const [missingOnly, setMissingOnly] = useMissingOnly();

    const handleChange = useCallback(() => {
        if (hasMissing) {
            setMissingOnly(!missingOnly);
        }
        onClick?.();
    }, [hasMissing, missingOnly, onClick, setMissingOnly]);

    return <Checkbox variant="outline" disabled={!hasMissing} checked={!missingOnly} onChange={handleChange} />;
}
