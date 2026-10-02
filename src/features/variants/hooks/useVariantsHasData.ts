import { isEmpty } from 'lodash';

import { useGroups } from '~/store/groups';
import { useVariants } from '~/store/variants';

export function useVariantsHasData(): boolean {
    const groups = useGroups();
    const variants = useVariants();
    return !isEmpty(groups) && !isEmpty(variants);
}
