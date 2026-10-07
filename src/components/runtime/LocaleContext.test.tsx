import { renderHook } from '@testing-library/react';

import React, { use } from 'react';

import { LocaleContext, SetLocaleContext } from '~/components/runtime/LocaleContext';

describe('<LocaleContext>', () => {
    afterEach(() => {});

    it('uses context with default locale', () => {
        const { result } = renderHook(() => use(LocaleContext));

        expect(result.current).toBe('en-US');
    });

    it('uses context with custom locale', () => {
        const { result } = renderHook(() => use(LocaleContext), {
            wrapper: ({ children }: React.PropsWithChildren) => <LocaleContext value="de-DE">{children}</LocaleContext>,
        });

        expect(result.current).toBe('de-DE');
    });

    it('exposes the locale setter through its provider', () => {
        const setLocale = vi.fn();
        const { result } = renderHook(() => use(SetLocaleContext), {
            wrapper: ({ children }: React.PropsWithChildren) => (
                <SetLocaleContext value={setLocale}>{children}</SetLocaleContext>
            ),
        });

        result.current('lt-LT');

        expect(setLocale).toHaveBeenCalledExactlyOnceWith('lt-LT');
    });

    it('has a harmless default setter outside the application provider', () => {
        const { result } = renderHook(() => use(SetLocaleContext));

        expect(result.current('en-US')).toBeUndefined();
    });
});
