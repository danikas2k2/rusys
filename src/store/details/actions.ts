import type { Details, Name, Value, Year } from '~/store/details/types';

export const enum DetailsActionType {
    SET = 'details.set',
    RENAME = 'details.rename',
    REMOVE = 'details.remove',
    UPDATE = 'details.update',
}

export type DetailsAction =
    | {
          type: DetailsActionType.SET;
          details: Details;
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
          value?: Value;
      };

export const setDetailsAction = (details: Details): DetailsAction => ({ type: DetailsActionType.SET, details });

export const renameDetailsAction = (name: Name, newName: Name): DetailsAction => ({
    type: DetailsActionType.RENAME,
    name,
    newName,
});

export const removeDetailsAction = (name: Name): DetailsAction => ({
    type: DetailsActionType.REMOVE,
    name,
});

export const updateDetailsAction = (name: Name, year?: Year, value?: Value): DetailsAction => ({
    type: DetailsActionType.UPDATE,
    name,
    year,
    value,
});
