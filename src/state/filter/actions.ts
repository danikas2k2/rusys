export const enum FilterActionType {
    SET = 'filter.set',
    CLEAR = 'filter.clear',
}

export type FilterAction =
    | {
          type: FilterActionType.SET;
          filter: string;
      }
    | {
          type: FilterActionType.CLEAR;
      };

export const setFilterAction = (filter: string): FilterAction => ({ type: FilterActionType.SET, filter });

export const clearFilterAction = (): FilterAction => ({ type: FilterActionType.CLEAR });
