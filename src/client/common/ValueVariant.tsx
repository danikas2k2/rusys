import React from 'react';
import { type Variant } from '~/common/types';
import { useVariant } from '~/state/variants/useVariant';

interface ValueVariantProps {
    group: string;
    variant: string;
    format?: 'short' | 'long';
}

export function ValueVariant({ group, variant, format = 'short' }: ValueVariantProps) {
    const { short = variant, long = variant }: Variant = useVariant(group, variant) ?? ({} as Variant);
    if (format === 'long') {
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
    return <>{short}</>;
}
