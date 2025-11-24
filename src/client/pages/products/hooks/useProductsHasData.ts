import { isEmpty } from 'lodash';

import { useGroups } from '~/client/state/groups/useGroups';
import { useProducts } from '~/client/state/products/useProducts';
import { useVariants } from '~/client/state/variants/useVariants';
import { useYears } from '~/client/state/years/useYears';

export function useProductsHasData() {
    const years = useYears();
    const groups = useGroups();
    const variants = useVariants();
    const products = useProducts();
    return !isEmpty(years) && !isEmpty(groups) && !isEmpty(variants) && !isEmpty(products);
}
