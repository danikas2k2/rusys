import type { History } from '@rusys/common/data';

export const enum HistoryActionType {
    SET_UPDATES = 'updates.set',
    SET_UNDATES = 'undates.set',
}

export type HistoryAction =
    | { type: HistoryActionType.SET_UPDATES; updates: readonly History[] }
    | { type: HistoryActionType.SET_UNDATES; undates: readonly History[] };

export const setUpdatesAction = (updates: readonly History[]): Readonly<HistoryAction> => ({
    type: HistoryActionType.SET_UPDATES,
    updates,
});

export const setUndatesAction = (undates: readonly History[]): Readonly<HistoryAction> => ({
    type: HistoryActionType.SET_UNDATES,
    undates,
});
