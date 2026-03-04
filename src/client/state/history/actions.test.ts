import { HistoryActionType, setHistoryAction } from '~/client/state/history/actions';
import type { History } from '~/types/data';

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

        expect(setHistoryAction(history)).toStrictEqual({
            type: HistoryActionType.SET,
            history,
        });
    });

    it('returns valid action for empty set', () => {
        const history: History[] = [];

        expect(setHistoryAction(history)).toStrictEqual({
            type: HistoryActionType.SET,
            history,
        });
    });
});
