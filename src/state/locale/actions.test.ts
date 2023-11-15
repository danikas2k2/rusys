import { LocaleActionType, setLocaleAction } from '~/state/locale/actions';

describe('setLocaleAction', () => {
    it('returns valid action', () => {
        expect(setLocaleAction('lt-LT')).toEqual({
            type: LocaleActionType.SET,
            locale: 'lt-LT',
        });
    });
});
