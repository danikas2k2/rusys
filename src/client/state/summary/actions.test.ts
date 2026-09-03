import { getSummaryFixture } from '@tests/fixtures';

import type { Summary } from '@rusys/common/data';

import { setSummaryAction, SummaryActionType } from '~/client/state/summary/actions';

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
