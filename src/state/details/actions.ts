import { type Amount, type AmountSet } from '~/state/details/types';
import { type Group, type Name, type Year } from '~/state/types';

export const enum DetailsActionType {
    SET = 'details.set',
    RENAME = 'details.rename',
    RENAME_GROUP = 'details.renameGroup',
    REMOVE = 'details.remove',
    REMOVE_GROUP = 'details.removeGroup',
    MOVE = 'details.move',
    UPDATE = 'details.update',
}

export type DetailsAction =
    | {
          type: DetailsActionType.SET;
          details: AmountSet;
      }
    | {
          type: DetailsActionType.RENAME;
          group: Group;
          name: Name;
          newName: Name;
      }
    | {
          type: DetailsActionType.RENAME_GROUP;
          group: Group;
          newGroup: Group;
      }
    | {
          type: DetailsActionType.REMOVE;
          group: Group;
          name: Name;
      }
    | {
          type: DetailsActionType.REMOVE_GROUP;
          group: Group;
      }
    | {
          type: DetailsActionType.MOVE;
          group: Group;
          name: Name;
          newGroup: Group;
      }
    | {
          type: DetailsActionType.UPDATE;
          group: Group;
          name: Name;
          year?: Year;
          value?: Amount;
      };

export const setDetailsAction = (details: AmountSet): DetailsAction => ({
    type: DetailsActionType.SET,
    details,
});

export const renameDetailsAction = (group: Group, name: Name, newName: Name): DetailsAction => ({
    type: DetailsActionType.RENAME,
    group,
    name,
    newName,
});

export const renameGroupAction = (group: Group, newGroup: Group): DetailsAction => ({
    type: DetailsActionType.RENAME_GROUP,
    group,
    newGroup,
});

export const removeDetailsAction = (group: Group, name: Name): DetailsAction => ({
    type: DetailsActionType.REMOVE,
    group,
    name,
});

export const removeGroupAction = (group: Group): DetailsAction => ({
    type: DetailsActionType.REMOVE_GROUP,
    group,
});

export const updateDetailsAction = (group: Group, name: Name, year?: Year, value?: Amount): DetailsAction => ({
    type: DetailsActionType.UPDATE,
    group,
    name,
    year,
    value,
});

export const moveDetailsAction = (group: Group, name: Name, newGroup: Group): DetailsAction => ({
    type: DetailsActionType.MOVE,
    group,
    name,
    newGroup,
});
