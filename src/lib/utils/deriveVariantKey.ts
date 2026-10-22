import type { VariantUnits } from '~/schema/variants';

export function deriveVariantKey(count: number | undefined | null | '', units: VariantUnits): string {
    return count ? `${count}${units}` : '';
}
