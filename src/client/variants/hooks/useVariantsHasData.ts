import { useGroups } from '~/state/groups/useGroups';
import { useVariants } from '~/state/variants/useVariants';
import { isEmpty } from 'lodash';

export function useVariantsHasData(): boolean {
    const groups = useGroups();
    const variants = useVariants();
    return !isEmpty(groups) && !isEmpty(variants);
}
