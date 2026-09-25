import { isEmpty } from 'lodash';

import { useGroups } from '~/store/groups/useGroups';
import { useVariants } from '~/store/variants/useVariants';

export function useVariantsHasData(): boolean {
    const groups = useGroups();
    const variants = useVariants();
    return !isEmpty(groups) && !isEmpty(variants);
}
