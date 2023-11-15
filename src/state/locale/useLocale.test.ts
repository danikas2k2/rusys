import { act, renderHook } from '@testing-library/react';
import { DEFAULT_LOCALE } from '~/state/locale/actions';
import locale from '~/state/locale/reducer';
import { type Locale } from '~/state/locale/types';
import { useLocale } from '~/state/locale/useLocale';
import { withReduxState } from '~/tests/withReduxState';

describe('useLocale', () => {
    it('return empty list for empty state', () => {
        const { result } = renderHook(() => useLocale(), withReduxState({}, { locale }));
        expect(result.current).toEqual(DEFAULT_LOCALE);
    });

    it('return filled state', () => {
        const { result } = renderHook(() => useLocale(), withReduxState({ locale: 'de-DE' }, { locale }));
        expect(result.current).toEqual('de-DE');
    });

    it('return updated state', () => {
        const { rerender, result } = renderHook(
            (locale?: Locale) => useLocale(locale),
            withReduxState({ locale: 'de-DE' }, { locale })
        );
        expect(result.current).toEqual('de-DE');
        act(() => rerender('lt-LT'));
        expect(result.current).toEqual('lt-LT');
        act(() => rerender());
        expect(result.current).toEqual('lt-LT');
    });
});
