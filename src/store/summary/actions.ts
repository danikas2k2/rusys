import type { ProductHistory, Summary } from '~/common/data';

export const enum SummaryActionType {
    SET = 'summary.set',
    SET_HISTORY = 'summary.set.history',
}

export type SummaryAction =
    | {
          type: SummaryActionType.SET;
          summary: Summary[];
      }
    | {
          type: SummaryActionType.SET_HISTORY;
          group: string;
          name: string;
          year: number;
          history: ProductHistory;
      };

export const setSummaryAction = (summary: Summary[]): SummaryAction => ({
    type: SummaryActionType.SET,
    summary,
});

export const setSummaryHistoryAction = (
    group: string,
    name: string,
    year: number,
    history: ProductHistory
): Readonly<SummaryAction> => ({
    type: SummaryActionType.SET_HISTORY,
    group,
    name,
    year,
    history,
});
