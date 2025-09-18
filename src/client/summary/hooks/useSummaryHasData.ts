import { isEmpty } from 'lodash';

import { useGroups } from '~/state/groups/useGroups';
import { useSummary } from '~/state/summary/useSummary';
import { useVariants } from '~/state/variants/useVariants';
import { useYears } from '~/state/years/useYears';

export function useSummaryHasData(): boolean {
    const years = useYears();
    const groups = useGroups();
    const variants = useVariants();
    const summary = useSummary();
    return !isEmpty(years) && !isEmpty(groups) && !isEmpty(variants) && !isEmpty(summary);
}
