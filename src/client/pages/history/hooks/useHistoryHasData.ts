import { isEmpty } from 'lodash';

import { useGroups } from '~/client/state/groups/useGroups';
import { useHistory } from '~/client/state/history/useHistory';
import { useVariants } from '~/client/state/variants/useVariants';
import { useYears } from '~/client/state/years/useYears';

export function useHistoryHasData() {
    // const years = useYears();
    // const groups = useGroups();
    // const variants = useVariants();
    const history = useHistory();
    return /*!isEmpty(years) && !isEmpty(groups) && !isEmpty(variants) &&*/ !isEmpty(history);
}
