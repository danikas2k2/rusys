import { HistoryActionType, type HistoryAction } from '~/client/state/history/actions';
import { updates as reducer, undates as undatesReducer } from '~/client/state/history/reducer';
import type { History } from '~/types/data';

describe('history', () => {
    const history: History[] = [
        {
            group: 'Uogienės',
            name: 'Avietės',
            time: Date.parse('2023-01-01T12:00:00.000Z'),
            year: 22,
        },
    ];

    describe('default', () => {
        const unknownAction = { type: 'unknown' as HistoryActionType } as HistoryAction;

        it('leave set unchanged', () => {
            expect(reducer(history, unknownAction)).toStrictEqual(history);
        });

        it('leave empty set unchanged', () => {
            expect(reducer([], unknownAction)).toStrictEqual([]);
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toStrictEqual([]);
        });
    });

    describe('set', () => {
        it('update empty state', () => {
            expect(
                reducer([], {
                    type: HistoryActionType.SET_UPDATES,
                    updates: history,
                })
            ).toStrictEqual(history);
        });

        it('update empty state with empty set', () => {
            expect(
                reducer([], {
                    type: HistoryActionType.SET_UPDATES,
                    updates: [],
                })
            ).toStrictEqual([]);
        });

        it('update filled state', () => {
            expect(
                reducer(history.slice(0, 1), {
                    type: HistoryActionType.SET_UPDATES,
                    updates: history,
                })
            ).toStrictEqual(history);
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: HistoryActionType.SET_UPDATES,
                    updates: history,
                })
            ).toStrictEqual(history);
        });

        it('return deep clone of history', () => {
            const result = reducer([], { type: HistoryActionType.SET_UPDATES, updates: history });

            expect(result).toStrictEqual(history);
            expect(result).not.toBe(history);
        });
    });

    describe('undates', () => {
        const unknownAction = { type: 'unknown' as HistoryActionType } as HistoryAction;

        it('leaves state unchanged for an unrelated action', () => {
            expect(undatesReducer(history, unknownAction)).toStrictEqual(history);
        });

        it('returns default state for undefined', () => {
            expect(undatesReducer(undefined, unknownAction)).toStrictEqual([]);
        });

        it('replaces state with a deep clone on SET_UNDATES', () => {
            const result = undatesReducer([], { type: HistoryActionType.SET_UNDATES, undates: history });

            expect(result).toStrictEqual(history);
            expect(result).not.toBe(history);
        });
    });
});
