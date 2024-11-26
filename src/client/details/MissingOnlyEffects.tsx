import { useEffect } from 'react';
import { useMissingOnly } from '~/client/details/MissingOnlyContext';
import { useHasMissing } from '~/state/details/useHasMissing';

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
