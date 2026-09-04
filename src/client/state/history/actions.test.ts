import type { History } from '@rusys/common/data';

import { HistoryActionType, setUndatesAction, setUpdatesAction } from '~/client/state/history/actions';

describe('setHistoryAction', () => {
    it('returns valid action', () => {
        const history: History[] = [
            {
                group: 'Uogienės',
                name: 'Avietės',
                time: Date.parse('2023-01-01T12:00:00.000Z'),
                year: 22,
            },
        ];

        expect(setUpdatesAction(history)).toStrictEqual({
            type: HistoryActionType.SET_UPDATES,
            updates: history,
        });
    });

    it('returns valid action for empty set', () => {
        const history: History[] = [];

        expect(setUpdatesAction(history)).toStrictEqual({
            type: HistoryActionType.SET_UPDATES,
            updates: history,
        });
    });
});

describe('setUndatesAction', () => {
    it('returns valid undates action', () => {
        const history: History[] = [{ group: 'Uogienės', name: 'Avietės', time: 1000, year: 22 }];

        expect(setUndatesAction(history)).toStrictEqual({
            type: HistoryActionType.SET_UNDATES,
            undates: history,
        });
    });
});
