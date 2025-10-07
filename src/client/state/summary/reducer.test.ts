import { getSummaryFixture } from '@tests/fixtures';

import { SummaryActionType, type SummaryAction } from '~/client/state/summary/actions';
import { summary as reducer } from '~/client/state/summary/reducer';

describe('summary', () => {
    const state = getSummaryFixture();

    describe('default', () => {
        const unknownAction = { type: 'unknown' as SummaryActionType } as SummaryAction;

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
            expect(reducer([], { type: SummaryActionType.SET, summary: state })).toStrictEqual(state);
        });

        it('update empty state with empty set', () => {
            expect(reducer([], { type: SummaryActionType.SET, summary: [] })).toStrictEqual([]);
        });

        it('update filled state', () => {
            expect(reducer(state, { type: SummaryActionType.SET, summary: state })).toStrictEqual(state);
        });

        it('update undefined state', () => {
            expect(reducer(undefined, { type: SummaryActionType.SET, summary: state })).toStrictEqual(state);
        });
    });
});
