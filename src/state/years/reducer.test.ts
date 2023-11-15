import { type YearsAction, YearsActionType } from '~/state/years/actions';
import reducer from '~/state/years/reducer';
import { type Years } from '~/state/years/types';

describe('years', () => {
    const state: Years = [21, 22, 23];

    describe('default', () => {
        const unknownAction = { type: 'unknown' as YearsActionType } as YearsAction;

        it('leave set unchanged', () => {
            expect(reducer(state, unknownAction)).toEqual(state);
        });

        it('leave empty set unchanged', () => {
            expect(reducer([], unknownAction)).toEqual([]);
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toEqual([]);
        });
    });

    describe('set', () => {
        it('update empty state', () => {
            expect(reducer([], { type: YearsActionType.SET, years: state })).toEqual(state);
        });

        it('update empty state with empty set', () => {
            expect(reducer([], { type: YearsActionType.SET, years: [] })).toEqual([]);
        });

        it('update filled state', () => {
            expect(reducer([19, 20, 21], { type: YearsActionType.SET, years: state })).toEqual(state);
        });

        it('update undefined state', () => {
            expect(reducer(undefined, { type: YearsActionType.SET, years: state })).toEqual(state);
        });
    });
});
