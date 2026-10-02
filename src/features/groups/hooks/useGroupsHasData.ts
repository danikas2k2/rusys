import { isEmpty } from 'lodash';

import { useGroups } from '~/store/groups';

export function useGroupsHasData() {
    return !isEmpty(useGroups());
}
