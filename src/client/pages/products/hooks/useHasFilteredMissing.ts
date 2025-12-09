import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useProducts } from '~/client/state/products/useProducts';

export function useHasFilteredMissing() {
    const groupFilter = useGroupFilterPredicate();
    const quickFilter = useQuickFilterPredicate();
    return useProducts().some((product) => groupFilter(product.group) && quickFilter(product.name) && product.missing);
}
