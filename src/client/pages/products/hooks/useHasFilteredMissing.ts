import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useProducts } from '~/client/state/products/useProducts';

// Checked across every category, not just the selected one - the checkbox should only
// auto-revert once nothing anywhere still matches, not as soon as the current tab empties out.
export function useHasFilteredMissing() {
    const quickFilter = useQuickFilterPredicate();
    return useProducts().some((product) => quickFilter(product.name) && product.missing);
}
