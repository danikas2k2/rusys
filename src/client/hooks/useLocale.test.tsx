import React, { type PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react';
import { DEFAULT_LOCALE, LocaleContext } from '~/client/common/LocaleContext';
import { useLocale } from '~/client/hooks/useLocale';

describe('useLocale', () => {
    it('returns default locale for undefined context', () => {
        const { result } = renderHook(() => useLocale());

        expect(result.current).toStrictEqual(DEFAULT_LOCALE);
    });

    it('return filled state', () => {
        const { result } = renderHook(() => useLocale(), {
            wrapper: ({ children }: PropsWithChildren) => <LocaleContext value="de-DE">{children}</LocaleContext>,
        });

        expect(result.current).toBe('de-DE');
    });
});
