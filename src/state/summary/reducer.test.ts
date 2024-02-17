import { type SummaryAction, SummaryActionType } from '~/state/summary/actions';
import { summary as reducer } from '~/state/summary/reducer';
import { getTestSummary } from '~/tests/fixtures';

describe('summary', () => {
    const state = getTestSummary();

    describe('default', () => {
        const unknownAction = { type: 'unknown' as SummaryActionType } as SummaryAction;

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
            expect(reducer([], { type: SummaryActionType.SET, summary: state })).toEqual(state);
        });

        it('update empty state with empty set', () => {
            expect(reducer([], { type: SummaryActionType.SET, summary: [] })).toEqual([]);
        });

        it('update filled state', () => {
            expect(reducer(state, { type: SummaryActionType.SET, summary: state })).toEqual(state);
        });

        it('update undefined state', () => {
            expect(reducer(undefined, { type: SummaryActionType.SET, summary: state })).toEqual(state);
        });
    });
});
