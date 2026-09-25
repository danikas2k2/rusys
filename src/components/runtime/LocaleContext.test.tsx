import { renderHook } from '@testing-library/react';

import React, { use } from 'react';

import { LocaleContext } from '~/components/runtime/LocaleContext';

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
});
