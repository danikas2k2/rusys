import { isEmpty } from 'lodash';

import { useGroups } from '~/client/state/groups/useGroups';

export function useGroupsHasData() {
    const groups = useGroups();
    return !isEmpty(groups);
}
