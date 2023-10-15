import { type Name } from '~/store/types';

export const enum MissingActionType {
    SET = 'missing.set',
    ADD = 'missing.add',
    REMOVE = 'missing.remove',
}

export type MissingAction =
    | {
          type: MissingActionType.SET;
          missing: Name[];
      }
    | {
          type: MissingActionType.ADD;
          name: Name;
      }
    | {
          type: MissingActionType.REMOVE;
          name: Name;
      };

export const setMissingAction = (missing: Name[]): MissingAction => ({ type: MissingActionType.SET, missing });

export const addMissingAction = (name: Name): MissingAction => ({ type: MissingActionType.ADD, name });

export const removeMissingAction = (name: Name): MissingAction => ({ type: MissingActionType.REMOVE, name });
