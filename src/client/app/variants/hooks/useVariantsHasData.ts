import { isEmpty } from 'lodash';

import { useGroups } from '~/client/state/groups/useGroups';
import { useVariants } from '~/client/state/variants/useVariants';

export function useVariantsHasData(): boolean {
    const groups = useGroups();
    const variants = useVariants();
    return !isEmpty(groups) && !isEmpty(variants);
}
