import { Checkbox } from '@mantine/core';
import React, { useCallback, useEffect, useMemo } from 'react';

import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { useLabels } from '~/client/hooks/useLabels';
import { useHasFilteredMissing } from '~/client/pages/products/hooks/useHasFilteredMissing';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { useHasMissing } from '~/client/state/products/useHasMissing';
import { useProducts } from '~/client/state/products/useProducts';

export function MissingOnlyCheckbox({ onClick }: { onClick?: () => void }) {
    const _ = useLabels();
    const hasMissing = useHasMissing();
    const products = useProducts();
    const missingCount = useMemo(() => products.filter((product) => product.missing).length, [products]);
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
            label={
                missingCount
                    ? _(missingCount === 1 ? 'Missing {count} product' : 'Missing {count} products').replace(
                          '{count}',
                          String(missingCount)
                      )
                    : _('No products missing')
            }
        />
    );
}
