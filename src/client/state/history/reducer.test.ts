import { HistoryActionType, type HistoryAction } from '~/client/state/history/actions';
import { history as reducer } from '~/client/state/history/reducer';
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
                    type: HistoryActionType.SET,
                    history,
                })
            ).toStrictEqual(history);
        });

        it('update empty state with empty set', () => {
            expect(
                reducer([], {
                    type: HistoryActionType.SET,
                    history: [],
                })
            ).toStrictEqual([]);
        });

        it('update filled state', () => {
            expect(
                reducer(history.slice(0, 1), {
                    type: HistoryActionType.SET,
                    history,
                })
            ).toStrictEqual(history);
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: HistoryActionType.SET,
                    history,
                })
            ).toStrictEqual(history);
        });

        it('return deep clone of history', () => {
            const result = reducer([], { type: HistoryActionType.SET, history });

            expect(result).toStrictEqual(history);
            expect(result).not.toBe(history);
        });
    });
});
