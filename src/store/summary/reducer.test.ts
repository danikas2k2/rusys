import { getSummaryFixture } from '@tests/fixtures';

import { SummaryActionType, type SummaryAction } from '~/store/summary/actions';
import { summary as reducer } from '~/store/summary/reducer';

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

        it('keeps a summary history cache while refreshing summary metadata', () => {
            const history = { 22: { updates: [], undates: [] } };
            const cached = [{ ...state[0], history }, ...state.slice(1)];

            expect(reducer(cached, { type: SummaryActionType.SET, summary: state })).toStrictEqual([
                { ...state[0], history },
                ...state.slice(1),
            ]);
        });

        it('update undefined state', () => {
            expect(reducer(undefined, { type: SummaryActionType.SET, summary: state })).toStrictEqual(state);
        });
    });

    describe('set history', () => {
        it('caches history under its summary product and year', () => {
            const history = { updates: [], undates: [] };

            expect(
                reducer(state, {
                    type: SummaryActionType.SET_HISTORY,
                    group: state[0].group,
                    name: state[0].name,
                    year: 22,
                    history,
                })
            ).toStrictEqual([{ ...state[0], history: { 22: history } }, ...state.slice(1)]);
        });
    });
});
