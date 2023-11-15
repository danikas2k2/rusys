import { type NameWithGroup } from '~/state/details/types';
import { type Group, type Name } from '~/state/types';

export const enum MissingActionType {
    SET = 'missing.set',
    ADD = 'missing.add',
    REMOVE = 'missing.remove',
    REMOVE_GROUP = 'missing.removeGroup',
}

export type MissingAction =
    | {
          type: MissingActionType.SET;
          missing: (Name | NameWithGroup)[];
      }
    | {
          type: MissingActionType.ADD;
          group: Group;
          name: Name;
      }
    | {
          type: MissingActionType.REMOVE;
          group: Group;
          name: Name;
      }
    | {
          type: MissingActionType.REMOVE_GROUP;
          group: Group;
      };

export const setMissingAction = (missing: (Name | NameWithGroup)[]): MissingAction => ({
    type: MissingActionType.SET,
    missing,
});

export const addMissingAction = (group: Group, name: Name): MissingAction => ({
    type: MissingActionType.ADD,
    group,
    name,
});

export const removeMissingAction = (group: Group, name: Name): MissingAction => ({
    type: MissingActionType.REMOVE,
    group,
    name,
});

export const removeMissingGroupAction = (group: Group): MissingAction => ({
    type: MissingActionType.REMOVE_GROUP,
    group,
});
