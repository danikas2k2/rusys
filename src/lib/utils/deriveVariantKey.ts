import type { VariantUnits } from '~/schema';

export function deriveVariantKey(count: number | undefined | null | '', units: VariantUnits): string {
    return count ? `${count}${units}` : '';
}
