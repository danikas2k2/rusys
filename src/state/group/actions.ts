export const enum GroupActionType {
    SET = 'group.set',
    CLEAR = 'group.clear',
}

export type GroupAction =
    | {
          type: GroupActionType.SET;
          group: string;
      }
    | {
          type: GroupActionType.CLEAR;
      };

export const setGroupAction = (group: string): Readonly<GroupAction> => ({
    type: GroupActionType.SET,
    group,
});

export const clearGroupAction = (): Readonly<GroupAction> => ({ type: GroupActionType.CLEAR });
