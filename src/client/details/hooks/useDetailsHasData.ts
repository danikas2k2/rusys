import { isEmpty } from 'lodash';

import { useDetails } from '~/client/state/details/useDetails';
import { useGroups } from '~/client/state/groups/useGroups';
import { useVariants } from '~/client/state/variants/useVariants';
import { useYears } from '~/client/state/years/useYears';

export function useDetailsHasData() {
    const years = useYears();
    const groups = useGroups();
    const variants = useVariants();
    const details = useDetails();
    return !isEmpty(years) && !isEmpty(groups) && !isEmpty(variants) && !isEmpty(details);
}
