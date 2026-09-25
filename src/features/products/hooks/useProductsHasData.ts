import { isEmpty } from 'lodash';

import { useGroups } from '~/store/groups/useGroups';
import { useProducts } from '~/store/products/useProducts';
import { useVariants } from '~/store/variants/useVariants';
import { useYears } from '~/store/years/useYears';

export function useProductsHasData() {
    const years = useYears();
    const groups = useGroups();
    const variants = useVariants();
    const products = useProducts();
    return !isEmpty(years) && !isEmpty(groups) && !isEmpty(variants) && !isEmpty(products);
}
