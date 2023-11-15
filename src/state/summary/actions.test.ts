import { type AmountSet } from '~/state/details/types';
import { setSummaryAction, SummaryActionType } from '~/state/summary/actions';

describe('setSummaryAction', () => {
    it('returns valid action', () => {
        const summary: AmountSet = { G: { A: { 21: { '': 1 }, 22: { '': 2, d: 3 } } } };
        expect(setSummaryAction(summary)).toEqual({ type: SummaryActionType.SET, summary });
    });

    it('returns valid action for empty set', () => {
        const summary = {};
        expect(setSummaryAction(summary)).toEqual({ type: SummaryActionType.SET, summary });
    });
});
