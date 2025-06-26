import React from 'react';
import { useVariant } from '~/state/variants/useVariant';

interface ValueVariantProps {
    group: string;
    variant: string;
    suffix?: boolean;
}

export function ValueVariant({ group, variant, suffix = true }: ValueVariantProps) {
    const details = useVariant(group, variant);
    if (suffix) {
        return <>{details ? details.suffix : variant}</>;
    }

    const index = variant.trim().indexOf(' ');
    if (index > 0) {
        return (
            <>
                {variant.slice(0, index).trim()}
                <small>{variant.slice(index).trim()}</small>
            </>
        );
    }
    return <>{variant}</>;
}
