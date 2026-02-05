import type { History } from '~/types/data';

export const enum HistoryActionType {
    SET = 'history.set',
}

export type HistoryAction = {
    type: HistoryActionType.SET;
    history: readonly History[];
};

export const setHistoryAction = (history: readonly History[]): Readonly<HistoryAction> => ({
    type: HistoryActionType.SET,
    history,
});
