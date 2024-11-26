import { type Summary } from '~/common/types';
import { setSummaryAction, SummaryActionType } from '~/state/summary/actions';
import { getSummaryFixture } from '~/tests/fixtures';

describe('setSummaryAction', () => {
    it('returns valid action', () => {
        const summary = getSummaryFixture();
        expect(setSummaryAction(summary)).toEqual({ type: SummaryActionType.SET, summary });
    });

    it('returns valid action for empty set', () => {
        const summary: Summary[] = [];
        expect(setSummaryAction(summary)).toEqual({ type: SummaryActionType.SET, summary });
    });
});
