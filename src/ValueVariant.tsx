import type { Variant } from '~/store/details.types';

const VariantDisplay: Partial<Record<Variant, string>> = {
    // 'd': '¾l',
    // 'm': '¼l',
    '1.5': '1½',
    'x': '×',
};

interface ValueVariantProps {
    variant: Variant;
}

export function ValueVariant({ variant }: ValueVariantProps) {
    return variant ? <>{VariantDisplay[variant] ?? variant}</> : null;
}
