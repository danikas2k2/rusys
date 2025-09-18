import { isEmpty } from 'lodash';

import { useGroups } from '~/state/groups/useGroups';

export function useGroupsHasData() {
    const groups = useGroups();
    return !isEmpty(groups);
}
