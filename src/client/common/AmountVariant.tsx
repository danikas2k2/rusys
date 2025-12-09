import React from 'react';

interface AmountVariantProps {
    variant: string;
}

export function AmountVariant({ variant }: AmountVariantProps) {
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
