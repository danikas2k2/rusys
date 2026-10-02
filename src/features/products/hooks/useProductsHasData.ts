import { isEmpty } from 'lodash';

import { useGroups } from '~/store/groups';
import { useProducts } from '~/store/products';
import { useVariants } from '~/store/variants';
import { useYears } from '~/store/years';

export function useProductsHasData() {
    const years = useYears();
    const groups = useGroups();
    const variants = useVariants();
    const products = useProducts();
    return !isEmpty(years) && !isEmpty(groups) && !isEmpty(variants) && !isEmpty(products);
}
