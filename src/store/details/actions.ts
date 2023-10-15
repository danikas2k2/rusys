import { type Amount, type AmountSet } from '~/store/details/types';
import { type Name, type Year } from '~/store/types';

export const enum DetailsActionType {
    SET = 'details.set',
    RENAME = 'details.rename',
    REMOVE = 'details.remove',
    UPDATE = 'details.update',
}

export type DetailsAction =
    | {
          type: DetailsActionType.SET;
          details: AmountSet;
      }
    | {
          type: DetailsActionType.RENAME;
          name: Name;
          newName: Name;
      }
    | {
          type: DetailsActionType.REMOVE;
          name: Name;
      }
    | {
          type: DetailsActionType.UPDATE;
          name: Name;
          year?: Year;
          value?: Amount;
      };

export const setDetailsAction = (details: AmountSet): DetailsAction => ({ type: DetailsActionType.SET, details });

export const renameDetailsAction = (name: Name, newName: Name): DetailsAction => ({
    type: DetailsActionType.RENAME,
    name,
    newName,
});

export const removeDetailsAction = (name: Name): DetailsAction => ({
    type: DetailsActionType.REMOVE,
    name,
});

export const updateDetailsAction = (name: Name, year?: Year, value?: Amount): DetailsAction => ({
    type: DetailsActionType.UPDATE,
    name,
    year,
    value,
});
