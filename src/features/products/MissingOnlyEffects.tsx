import { startTransition, useEffect } from 'react';

import { useMissingOnly } from '~/features/products/MissingOnlyContext';
import { useHasMissing } from '~/store/products';

export function MissingOnlyEffects() {
    const hasMissing = useHasMissing();
    const [missingOnly, setMissingOnly] = useMissingOnly();
    useEffect(() => {
        if (missingOnly && !hasMissing) {
            startTransition(() => setMissingOnly(false));
        }
    }, [hasMissing, missingOnly, setMissingOnly]);
    return null;
}
