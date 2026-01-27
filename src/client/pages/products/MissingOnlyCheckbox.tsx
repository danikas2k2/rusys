import { Checkbox } from '@mantine/core';
import React, { useCallback, useEffect } from 'react';

import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { useHasFilteredMissing } from '~/client/pages/products/hooks/useHasFilteredMissing';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { useHasMissing } from '~/client/state/products/useHasMissing';

export function MissingOnlyCheckbox({ onClick }: { onClick?: () => void }) {
    const hasMissing = useHasMissing();
    const hasFilteredMissing = useHasFilteredMissing();

    const [missingOnly, setMissingOnly] = useMissingOnly();
    useEffect(() => {
        if (missingOnly && !hasFilteredMissing) {
            setMissingOnly(false);
        }
    }, [hasFilteredMissing, missingOnly, setMissingOnly]);

    const [, setFilter] = useQuickFilter();
    const handleChange = useCallback(() => {
        setMissingOnly(!missingOnly);
        if (!missingOnly && hasMissing && !hasFilteredMissing) {
            setFilter('');
        }
        onClick?.();
    }, [hasFilteredMissing, hasMissing, missingOnly, onClick, setFilter, setMissingOnly]);

    return (
        <Checkbox
            variant="outline"
            color="primary"
            disabled={!hasMissing}
            checked={!missingOnly}
            onChange={handleChange}
        />
    );
}
