import type { Details } from '~/types/data';

export const enum DetailsActionType {
    SET = 'details.set',
    SET_MISSING = 'details.set.missing',
    SET_REMOVING = 'details.set.removing',
}

export type DetailsAction =
    | {
          type: DetailsActionType.SET;
          details: readonly Details[];
      }
    | {
          type: DetailsActionType.SET_MISSING;
          group: string;
          name: string;
          missing: boolean;
      }
    | {
          type: DetailsActionType.SET_REMOVING;
          group: string;
          name: string;
          year: number;
          removing: boolean;
      };

export const setDetailsAction = (details: readonly Details[]): Readonly<DetailsAction> => ({
    type: DetailsActionType.SET,
    details,
});

export const setDetailsMissingAction = (group: string, name: string, missing: boolean): Readonly<DetailsAction> => ({
    type: DetailsActionType.SET_MISSING,
    group,
    name,
    missing,
});

export const setDetailsRemovingAction = (
    group: string,
    name: string,
    year: number,
    removing: boolean
): Readonly<DetailsAction> => ({
    type: DetailsActionType.SET_REMOVING,
    group,
    name,
    year,
    removing,
});
