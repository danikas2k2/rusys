import React from 'react';
import type { Variant } from '~/store/details/types';

const VariantShortFormat: Partial<Record<Variant, string>> = {
    // '': '½',
    // d: '¾',
    // m: '¼',
    '1.5': '1½',
    x: '×',
};

const VariantLongFormat: Partial<Record<Variant, string>> = {
    '': '500 ml.',
    d: '750 ml.',
    m: '250 ml.',
    e: 'Eglytės',
    1: '1 l.',
    '1.5': '1.5 l.',
    2: '2 l.',
    3: '3 l.',
    x: 'Blogi',
};

interface ValueVariantProps {
    variant: Variant;
    format?: 'short' | 'long';
}

export default function ValueVariant({ variant, format = 'short' }: ValueVariantProps): JSX.Element {
    if (format === 'long') {
        const s = VariantLongFormat[variant] ?? variant;
        const [s0, ...s1] = s.split(' ');
        if (s1.length) {
            return (
                <>
                    {s0}
                    <small>{s1.join(' ')}</small>
                </>
            );
        }
        return <>{s}</>;
    }
    return <>{VariantShortFormat[variant] ?? variant}</>;
}
