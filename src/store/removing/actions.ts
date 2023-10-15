import { type RemovingSet } from '~/store/removing/types';
import { type Name, type Year } from '~/store/types';

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
          name: Name;
          year: Year;
          removing: boolean;
      };

export const setRemovingAction = (removing: RemovingSet): RemovingAction => ({
    type: RemovingActionType.SET,
    removing,
});

export const updateRemovingAction = (name: Name, year: Year, removing: boolean): RemovingAction => ({
    type: RemovingActionType.UPDATE,
    name,
    year,
    removing,
});
