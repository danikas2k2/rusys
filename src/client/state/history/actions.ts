import type { History } from '~/types/data';

export const enum HistoryActionType {
    SET = 'history.set',
    SET_UNDATES = 'undates.set',
}

export type HistoryAction =
    | { type: HistoryActionType.SET; history: readonly History[] }
    | { type: HistoryActionType.SET_UNDATES; undates: readonly History[] };

export const setHistoryAction = (history: readonly History[]): Readonly<HistoryAction> => ({
    type: HistoryActionType.SET,
    history,
});

export const setUndatesAction = (undates: readonly History[]): Readonly<HistoryAction> => ({
    type: HistoryActionType.SET_UNDATES,
    undates,
});
