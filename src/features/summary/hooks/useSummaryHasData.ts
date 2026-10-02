import { isEmpty } from 'lodash';

import { useGroups } from '~/store/groups';
import { useSummary } from '~/store/summary';
import { useVariants } from '~/store/variants';
import { useYears } from '~/store/years';

export function useSummaryHasData(): boolean {
    const years = useYears();
    const groups = useGroups();
    const variants = useVariants();
    const summary = useSummary();
    return !isEmpty(years) && !isEmpty(groups) && !isEmpty(variants) && !isEmpty(summary);
}
