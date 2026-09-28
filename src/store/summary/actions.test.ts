import { getSummaryFixture } from '@tests/fixtures';

import type { Summary } from '~/common/data';
import { setSummaryAction, setSummaryHistoryAction, SummaryActionType } from '~/store/summary/actions';

describe('setSummaryAction', () => {
    it('returns valid action', () => {
        const summary = getSummaryFixture();

        expect(setSummaryAction(summary)).toStrictEqual({ type: SummaryActionType.SET, summary });
    });

    it('returns valid action for empty set', () => {
        const summary: Summary[] = [];

        expect(setSummaryAction(summary)).toStrictEqual({ type: SummaryActionType.SET, summary });
    });

    it('returns an action to cache one summary year history', () => {
        const history = { updates: [], undates: [] };

        expect(setSummaryHistoryAction('Uogienės', 'Avietės', 26, history)).toStrictEqual({
            type: SummaryActionType.SET_HISTORY,
            group: 'Uogienės',
            name: 'Avietės',
            year: 26,
            history,
        });
    });
});
