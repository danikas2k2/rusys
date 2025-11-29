import React from 'react';

interface ValueVariantProps {
    variant: string;
}

export function ValueVariant({ variant }: ValueVariantProps) {
    const index = variant.trim().indexOf(' ');
    if (index < 0) {
        return <>{variant}</>;
    }

    return (
        <>
            {variant.slice(0, index).trim()}
            <small>{variant.slice(index).trim()}</small>
        </>
    );
}
