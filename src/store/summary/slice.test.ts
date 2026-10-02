import { getSummaryFixture } from '@tests/fixtures';

import type { Summary } from '~/common/data';
import { summary as reducer, setSummaryAction, setSummaryHistoryAction } from './slice';

describe('setSummaryAction', () => {
    it('returns valid action', () => {
        const summary = getSummaryFixture();

        expect(setSummaryAction(summary)).toStrictEqual({ type: setSummaryAction.type, payload: summary });
    });

    it('returns valid action for empty set', () => {
        const summary: Summary[] = [];

        expect(setSummaryAction(summary)).toStrictEqual({ type: setSummaryAction.type, payload: summary });
    });

    it('returns an action to cache one summary year history', () => {
        const history = { updates: [], undates: [] };

        expect(setSummaryHistoryAction({ group: 'Uogienės', name: 'Avietės', year: 26, history })).toStrictEqual({
            type: setSummaryHistoryAction.type,
            payload: { group: 'Uogienės', name: 'Avietės', year: 26, history },
        });
    });
});

describe('summary', () => {
    const state = getSummaryFixture();

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
            expect(reducer([], setSummaryAction(state))).toStrictEqual(state);
        });

        it('update empty state with empty set', () => {
            expect(reducer([], setSummaryAction([]))).toStrictEqual([]);
        });

        it('update filled state', () => {
            expect(reducer(state, setSummaryAction(state))).toStrictEqual(state);
        });

        it('keeps a summary history cache while refreshing summary metadata', () => {
            const history = { 22: { updates: [], undates: [] } };
            const cached = [{ ...state[0], history }, ...state.slice(1)];

            expect(reducer(cached, setSummaryAction(state))).toStrictEqual([
                { ...state[0], history },
                ...state.slice(1),
            ]);
        });

        it('update undefined state', () => {
            expect(reducer(undefined, setSummaryAction(state))).toStrictEqual(state);
        });
    });

    describe('set history', () => {
        it('caches history under its summary product and year', () => {
            const history = { updates: [], undates: [] };

            expect(
                reducer(
                    state,
                    setSummaryHistoryAction({ group: state[0].group, name: state[0].name, year: 22, history })
                )
            ).toStrictEqual([{ ...state[0], history: { 22: history } }, ...state.slice(1)]);
        });
    });
});
