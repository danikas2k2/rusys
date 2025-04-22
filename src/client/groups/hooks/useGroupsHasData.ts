import { useGroups } from '~/state/groups/useGroups';
import { isEmpty } from 'lodash';

export function useGroupsHasData() {
    const groups = useGroups();
    return !isEmpty(groups);
}
