import { isEmpty } from 'lodash';

import { useGroups } from '~/client/state/groups/useGroups';
import { useSummary } from '~/client/state/summary/useSummary';
import { useVariants } from '~/client/state/variants/useVariants';
import { useYears } from '~/client/state/years/useYears';

export function useSummaryHasData(): boolean {
    const years = useYears();
    const groups = useGroups();
    const variants = useVariants();
    const summary = useSummary();
    return !isEmpty(years) && !isEmpty(groups) && !isEmpty(variants) && !isEmpty(summary);
}
