import type { VariantUnits } from '~/types/data';

export const DEFAULT_UNITS: VariantUnits = 'vnt';

export function deriveVariantKey(count: number | undefined | null | '', units: VariantUnits): string {
    return count ? `${count}${units}` : '';
}
