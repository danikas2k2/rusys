import React from 'react';
import { type Variant } from '~/common/types';
import { useVariant } from '~/state/variants/useVariant';

interface ValueVariantProps {
    variant: string;
    format?: 'short' | 'long';
}

export function ValueVariant({ variant, format = 'short' }: ValueVariantProps) {
    const { short = variant, long = variant }: Variant = useVariant(variant) ?? ({} as Variant);
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
