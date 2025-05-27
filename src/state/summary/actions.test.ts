import { getSummaryFixture } from '@tests/fixtures';
import { setSummaryAction, SummaryActionType } from '~/state/summary/actions';
import { type Summary } from '~/types/data';

describe('setSummaryAction', () => {
    it('returns valid action', () => {
        const summary = getSummaryFixture();

        expect(setSummaryAction(summary)).toStrictEqual({ type: SummaryActionType.SET, summary });
    });

    it('returns valid action for empty set', () => {
        const summary: Summary[] = [];

        expect(setSummaryAction(summary)).toStrictEqual({ type: SummaryActionType.SET, summary });
    });
});
