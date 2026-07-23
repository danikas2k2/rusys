import React from 'react';

interface VariantLabelProps {
    count: number | string;
    units?: string;
}

export function VariantLabel({ count, units = 'vnt' }: VariantLabelProps) {
    return count ? (
        <>
            {count}
            <small>
                {' '}
                {units}
                {!units.endsWith('.') && '.'}
            </small>
        </>
    ) : null;
}
