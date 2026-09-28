import { isEmpty } from 'lodash';

import { useGroups } from '~/store/groups/useGroups';
import { useSummary } from '~/store/summary/useSummary';
import { useVariants } from '~/store/variants/useVariants';
import { useYears } from '~/store/years/useYears';

export function useSummaryHasData(): boolean {
    const years = useYears();
    const groups = useGroups();
    const variants = useVariants();
    const summary = useSummary();
    return !isEmpty(years) && !isEmpty(groups) && !isEmpty(variants) && !isEmpty(summary);
}
