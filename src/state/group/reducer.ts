import { type GroupAction, GroupActionType } from '~/state/group/actions';

export function group(group: string = '', action: Readonly<GroupAction>): string {
    switch (action.type) {
        case GroupActionType.SET:
            return action.group;

        case GroupActionType.CLEAR:
            return '';

        default:
            return group;
    }
}
