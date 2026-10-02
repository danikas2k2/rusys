import { years as reducer, setYearsAction } from '~/store/years/slice';

describe('setYearsAction', () => {
    it('returns valid action', () => {
        expect(setYearsAction([21, 22, 23])).toStrictEqual({ type: setYearsAction.type, payload: [21, 22, 23] });
    });

    it('returns valid action for empty set', () => {
        expect(setYearsAction([])).toStrictEqual({ type: setYearsAction.type, payload: [] });
    });
});

describe('years', () => {
    const state: number[] = [21, 22, 23];

    describe('default', () => {
        const unknownAction = { type: 'unknown' };

        it('leave set unchanged', () => {
            expect(reducer(state, unknownAction)).toStrictEqual(state);
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
            expect(reducer([], setYearsAction(state))).toStrictEqual(state);
        });

        it('update empty state with empty set', () => {
            expect(reducer([], setYearsAction([]))).toStrictEqual([]);
        });

        it('update filled state', () => {
            expect(reducer([19, 20, 21], setYearsAction(state))).toStrictEqual(state);
        });

        it('update undefined state', () => {
            expect(reducer(undefined, setYearsAction(state))).toStrictEqual(state);
        });
    });
});
