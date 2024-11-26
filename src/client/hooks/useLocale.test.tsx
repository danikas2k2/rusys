import { renderHook } from '@testing-library/react';

import { DEFAULT_LOCALE } from '~/client/common/LocaleContext';
import { useLocale } from '~/client/hooks/useLocale';
import { withLocaleContext } from '~/tests/withLocaleContext';

describe('useLocale', () => {
    it('returns default locale for undefined context', () => {
        const { result } = renderHook(() => useLocale());
        expect(result.current).toEqual(DEFAULT_LOCALE);
    });

    it('return filled state', () => {
        const { result } = renderHook(() => useLocale(), withLocaleContext('de-DE'));
        expect(result.current).toEqual('de-DE');
    });
});
