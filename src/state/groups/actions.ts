import { type Group } from '~/common/types';

export const enum GroupsActionType {
    SET = 'groups.set',
    SWITCH = 'groups.switch',
    REORDER = 'groups.reorder',
    UPDATE = 'groups.update',
    RENAME = 'groups.rename',
    DELETE = 'groups.delete',
}

export type GroupsAction =
    | {
          type: GroupsActionType.SET;
          groups: Group[];
      }
    | {
          type: GroupsActionType.SWITCH;
          group: string;
          oppositeGroup: string;
      }
    | {
          type: GroupsActionType.REORDER;
          groups: Readonly<Record<string, number>>;
      }
    | {
          type: GroupsActionType.UPDATE;
          group: string;
          order?: number;
      }
    | {
          type: GroupsActionType.RENAME;
          group: string;
          newGroup: string;
      }
    | {
          type: GroupsActionType.DELETE;
          group: string;
      };

export const setGroupsAction = (groups: Group[]): GroupsAction => ({
    type: GroupsActionType.SET,
    groups,
});

export const switchGroupsAction = (group: string, oppositeGroup: string): GroupsAction => ({
    type: GroupsActionType.SWITCH,
    group,
    oppositeGroup,
});

export const reorderGroupsAction = (groups: Readonly<Record<string, number>>): GroupsAction => ({
    type: GroupsActionType.REORDER,
    groups,
});

export const updateGroupAction = (group: string, order?: number): GroupsAction => ({
    type: GroupsActionType.UPDATE,
    group,
    order,
});

export const renameGroupAction = (group: string, newGroup: string): GroupsAction => ({
    type: GroupsActionType.RENAME,
    group,
    newGroup,
});

export const deleteGroupAction = (group: string): GroupsAction => ({
    type: GroupsActionType.DELETE,
    group,
});
