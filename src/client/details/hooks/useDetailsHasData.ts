import { isEmpty } from 'lodash';
import { useDetails } from '~/state/details/useDetails';
import { useGroups } from '~/state/groups/useGroups';
import { useVariants } from '~/state/variants/useVariants';
import { useYears } from '~/state/years/useYears';

export function useDetailsHasData() {
    const years = useYears();
    const groups = useGroups();
    const variants = useVariants();
    const details = useDetails();
    return !isEmpty(years) && !isEmpty(groups) && !isEmpty(variants) && !isEmpty(details);
}
