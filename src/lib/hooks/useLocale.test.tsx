import { renderHook } from '@testing-library/react';

import React from 'react';

import { DEFAULT_LOCALE, LocaleContext } from '~/components/runtime/LocaleContext';
import { useLocale } from '~/lib/hooks/useLocale';

describe('useLocale', () => {
    it('returns default locale for undefined context', () => {
        const { result } = renderHook(() => useLocale());

        expect(result.current).toStrictEqual(DEFAULT_LOCALE);
    });

    it('return filled state', () => {
        const { result } = renderHook(() => useLocale(), {
            wrapper: ({ children }: React.PropsWithChildren) => <LocaleContext value="de-DE">{children}</LocaleContext>,
        });

        expect(result.current).toBe('de-DE');
    });

    it('returns DEFAULT_LOCALE when context value is undefined', () => {
        const { result } = renderHook(() => useLocale(), {
            wrapper: ({ children }: React.PropsWithChildren) => (
                <LocaleContext value={undefined}>{children}</LocaleContext>
            ),
        });

        expect(result.current).toBe(DEFAULT_LOCALE);
    });
});
