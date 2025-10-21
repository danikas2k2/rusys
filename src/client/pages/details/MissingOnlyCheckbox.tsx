import React, { useCallback } from 'react';

import { Checkbox } from '@ui/Checkbox';

import { useMissingOnly } from '~/client/pages/details/MissingOnlyContext';
import { useHasMissing } from '~/client/state/details/useHasMissing';

export function MissingOnlyCheckbox({ onClick }: { onClick?: () => void }) {
    const hasMissing = useHasMissing();
    const [missingOnly, setMissingOnly] = useMissingOnly();

    const handleClick = useCallback(() => {
        if (hasMissing) {
            setMissingOnly(!missingOnly);
        }
        onClick?.();
    }, [hasMissing, missingOnly, onClick, setMissingOnly]);

    return <Checkbox color="blue" checked={!missingOnly} disabled={!hasMissing} onClick={handleClick} />;
}
