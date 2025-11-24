import { isEmpty } from 'lodash';

import { useGroups } from '~/client/state/groups/useGroups';

export function useGroupsHasData() {
    return !isEmpty(useGroups());
}
