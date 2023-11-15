import { type RemovingSet } from '~/state/removing/types';
import { type Group, type Name, type Year } from '~/state/types';

export const enum RemovingActionType {
    SET = 'removing.set',
    UPDATE = 'removing.update',
}

export type RemovingAction =
    | {
          type: RemovingActionType.SET;
          removing: RemovingSet;
      }
    | {
          type: RemovingActionType.UPDATE;
          group: Group;
          name: Name;
          year: Year;
          removing: boolean;
      };

export const setRemovingAction = (removing: RemovingSet): RemovingAction => ({
    type: RemovingActionType.SET,
    removing,
});

export const updateRemovingAction = (group: Group, name: Name, year: Year, removing: boolean): RemovingAction => ({
    type: RemovingActionType.UPDATE,
    group,
    name,
    year,
    removing,
});
