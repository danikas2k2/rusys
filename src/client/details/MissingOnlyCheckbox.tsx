import { Checkbox } from '@ui/Checkbox';
import React, { useCallback } from 'react';

import { useMissingOnly } from '~/client/details/MissingOnlyContext';
import { useHasMissing } from '~/state/details/useHasMissing';

export function MissingOnlyCheckbox({ onClick }: { onClick?: () => void }) {
    const hasMissing = useHasMissing();
    const [missingOnly, setMissingOnly] = useMissingOnly();

    const handleClick = useCallback(() => {
        if (hasMissing) {
            setMissingOnly(!missingOnly);
        }
        onClick?.();
    }, [hasMissing, missingOnly, onClick, setMissingOnly]);

    return <Checkbox color="primary" checked={!missingOnly} disabled={!hasMissing} onClick={handleClick} />;
}
