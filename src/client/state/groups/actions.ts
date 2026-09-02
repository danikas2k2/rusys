import type { Group } from '~/common/data';

export const enum GroupsActionType {
    SET = 'groups.set',
}

export type GroupsAction = {
    type: GroupsActionType.SET;
    groups: Group[];
};

export const setGroupsAction = (groups: Group[]): GroupsAction => ({
    type: GroupsActionType.SET,
    groups,
});
