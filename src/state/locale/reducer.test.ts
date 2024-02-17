import { DEFAULT_LOCALE, type LocaleAction, LocaleActionType } from '~/state/locale/actions';
import { locale as reducer } from '~/state/locale/reducer';

describe('locale', () => {
    describe('default', () => {
        const unknownAction = { type: 'unknown' as LocaleActionType } as LocaleAction;

        it('leave set unchanged', () => {
            expect(reducer(DEFAULT_LOCALE, unknownAction)).toEqual(DEFAULT_LOCALE);
        });

        it('leave empty set unchanged', () => {
            expect(reducer('', unknownAction)).toEqual('');
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toEqual(DEFAULT_LOCALE);
        });
    });

    describe('set', () => {
        it('update empty state', () => {
            expect(
                reducer('', {
                    type: LocaleActionType.SET,
                    locale: 'lt-LT',
                })
            ).toEqual('lt-LT');
        });

        it('update empty state with empty set', () => {
            expect(
                reducer('', {
                    type: LocaleActionType.SET,
                    locale: '',
                })
            ).toEqual('');
        });

        it('update filled state', () => {
            expect(
                reducer(DEFAULT_LOCALE, {
                    type: LocaleActionType.SET,
                    locale: 'lt-LT',
                })
            ).toEqual('lt-LT');
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: LocaleActionType.SET,
                    locale: 'lt-LT',
                })
            ).toEqual('lt-LT');
        });
    });
});
