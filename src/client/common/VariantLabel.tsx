import React from 'react';

interface VariantLabelProps {
    count: number | string;
    units?: string;
}

const SMALL_UNITS: Record<string, string> = { l: 'ml', kg: 'g' };

function resolveDisplay(count: number | string, units: string): { count: number | string; units: string } {
    const smallUnit = SMALL_UNITS[units];
    if (typeof count === 'number' && smallUnit && count > 0 && count < 0.1) {
        return { count: Math.round(count * 1000), units: smallUnit };
    }
    return { count, units };
}

export function VariantLabel({ count, units = 'vnt' }: VariantLabelProps) {
    if (!count) {
        return null;
    }
    const display = resolveDisplay(count, units);
    return (
        <>
            {display.count}
            <small>
                {' '}
                {display.units}
                {!display.units.endsWith('.') && '.'}
            </small>
        </>
    );
}
