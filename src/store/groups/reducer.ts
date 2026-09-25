import { cloneDeep } from 'lodash';

import type { Group } from '~/common/data';
import { GroupsActionType, type GroupsAction } from '~/store/groups/actions';

export function groups(state: readonly Group[] = [], action: GroupsAction): readonly Group[] {
    switch (action.type) {
        case GroupsActionType.SET:
            return cloneDeep(action.groups);

        default:
            return state;
    }
}
