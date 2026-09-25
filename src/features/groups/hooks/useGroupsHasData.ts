import { isEmpty } from 'lodash';

import { useGroups } from '~/store/groups/useGroups';

export function useGroupsHasData() {
    return !isEmpty(useGroups());
}
