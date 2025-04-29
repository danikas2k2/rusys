import { YearsActionType, type YearsAction } from '~/state/years/actions';
import { years as reducer } from '~/state/years/reducer';

describe('years', () => {
    const state: number[] = [21, 22, 23];

    describe('default', () => {
        const unknownAction = { type: 'unknown' as YearsActionType } as YearsAction;

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
            expect(reducer([], { type: YearsActionType.SET, years: state })).toStrictEqual(state);
        });

        it('update empty state with empty set', () => {
            expect(reducer([], { type: YearsActionType.SET, years: [] })).toStrictEqual([]);
        });

        it('update filled state', () => {
            expect(reducer([19, 20, 21], { type: YearsActionType.SET, years: state })).toStrictEqual(state);
        });

        it('update undefined state', () => {
            expect(reducer(undefined, { type: YearsActionType.SET, years: state })).toStrictEqual(state);
        });
    });
});
