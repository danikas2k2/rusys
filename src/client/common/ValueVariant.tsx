import React from 'react';
import { useVariant } from '~/state/variants/useVariant';

interface ValueVariantProps {
    group: string;
    variant: string;
    format?: 'short' | 'long';
}

export function ValueVariant({ group, variant, format = 'short' }: ValueVariantProps) {
    const details = useVariant(group, variant);
    if (format === 'short') {
        return <>{details ? details.short : variant}</>;
    }

    const long = details?.long || variant;
    const [first, ...other] = long.split(' ');
    if (other.length) {
        return (
            <>
                {first}
                <small>{other.join(' ')}</small>
            </>
        );
    }
    return <>{long}</>;
}
