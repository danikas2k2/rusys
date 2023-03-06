export const enum FilterActionType {
    SET = 'filter.set',
    CLEAN = 'filter.clean',
}

export type FilterAction =
    | {
          type: FilterActionType.SET;
          filter: string;
      }
    | {
          type: FilterActionType.CLEAN;
      };

export const setFilterAction = (filter: string): FilterAction => ({ type: FilterActionType.SET, filter });

export const cleanFilterAction = (): FilterAction => ({ type: FilterActionType.CLEAN });
