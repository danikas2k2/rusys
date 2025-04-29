import { renderHook } from '@testing-library/react';
import { withLocaleContext } from '@tests/withLocaleContext';
import { DEFAULT_LOCALE } from '~/client/common/LocaleContext';
import { useLocale } from '~/client/hooks/useLocale';

describe('useLocale', () => {
    it('returns default locale for undefined context', () => {
        const { result } = renderHook(() => useLocale());

        expect(result.current).toStrictEqual(DEFAULT_LOCALE);
    });

    it('return filled state', () => {
        const { result } = renderHook(() => useLocale(), withLocaleContext('de-DE'));

        expect(result.current).toBe('de-DE');
    });
});
