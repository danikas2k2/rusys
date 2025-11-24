import { cloneDeep } from 'lodash';

import { GroupsActionType, type GroupsAction } from '~/client/state/groups/actions';
import type { Group } from '~/types/data';

export function groups(state: readonly Group[] = [], action: GroupsAction): readonly Group[] {
    switch (action.type) {
        case GroupsActionType.SET:
            return cloneDeep(action.groups);

        default:
            return state;
    }
}
