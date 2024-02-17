import { type Details, type VariantAmount, type YearAmounts } from '~/common/types';
import { type GroupsActionType } from '~/state/groups/actions';
import { type VariantsActionType } from '~/state/variants/actions';

export const enum DetailsActionType {
    SET = 'details.set',
    SET_YEARS = 'details.set.years',
    SET_AMOUNTS = 'details.set.amounts',
    SET_MISSING = 'details.set.missing',
    SET_REMOVING = 'details.set.removing',
    MOVE = 'details.move',
    RENAME = 'details.rename',
    DELETE = 'details.delete',
}

export type DetailsAction =
    | {
          type: DetailsActionType.SET;
          details: ReadonlyArray<Details>;
      }
    | {
          type: DetailsActionType.SET_YEARS;
          group: string;
          name: string;
          years?: ReadonlyArray<YearAmounts>;
      }
    | {
          type: DetailsActionType.SET_AMOUNTS;
          group: string;
          name: string;
          year?: number;
          amounts?: ReadonlyArray<VariantAmount>;
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
      }
    | {
          type: DetailsActionType.MOVE;
          group: string;
          name: string;
          newGroup: string;
      }
    | {
          type: DetailsActionType.RENAME;
          group: string;
          name: string;
          newName: string;
      }
    | {
          type: VariantsActionType.RENAME;
          group: string;
          variant: string;
          newVariant: string;
      }
    | {
          type: GroupsActionType.RENAME;
          group: string;
          newGroup: string;
      }
    | {
          type: DetailsActionType.DELETE;
          group: string;
          name: string;
      }
    | {
          type: VariantsActionType.DELETE;
          group: string;
          variant: string;
      }
    | {
          type: GroupsActionType.DELETE;
          group: string;
      };

export const setDetailsAction = (details: ReadonlyArray<Details>): Readonly<DetailsAction> => ({
    type: DetailsActionType.SET,
    details,
});

export const setDetailsYearsAction = (
    group: string,
    name: string,
    years?: ReadonlyArray<YearAmounts>
): Readonly<DetailsAction> => ({
    type: DetailsActionType.SET_YEARS,
    group,
    name,
    years,
});

export const setDetailsAmountsAction = (
    group: string,
    name: string,
    year?: number,
    amounts?: ReadonlyArray<VariantAmount>
): Readonly<DetailsAction> => ({
    type: DetailsActionType.SET_AMOUNTS,
    group,
    name,
    year,
    amounts,
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

export const moveDetailsAction = (group: string, name: string, newGroup: string): Readonly<DetailsAction> => ({
    type: DetailsActionType.MOVE,
    group,
    name,
    newGroup,
});

export const renameDetailsAction = (group: string, name: string, newName: string): Readonly<DetailsAction> => ({
    type: DetailsActionType.RENAME,
    group,
    name,
    newName,
});

export const deleteDetailsAction = (group: string, name: string): Readonly<DetailsAction> => ({
    type: DetailsActionType.DELETE,
    group,
    name,
});
