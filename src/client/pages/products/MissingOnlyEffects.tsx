import { useEffect } from 'react';

import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { useHasMissing } from '~/client/state/products/useHasMissing';

export function MissingOnlyEffects() {
    const hasMissing = useHasMissing();
    const [missingOnly, setMissingOnly] = useMissingOnly();
    useEffect(() => {
        if (missingOnly && !hasMissing) {
            setMissingOnly(false);
        }
    }, [hasMissing, missingOnly, setMissingOnly]);
    return null;
}
