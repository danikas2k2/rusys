import { renderHook } from '@testing-library/react';

import React, { use, type PropsWithChildren } from 'react';

import { LocaleContext } from '~/client/app/common/LocaleContext';

describe('<LocaleContext>', () => {
    afterEach(() => {});

    it('uses context with default locale', () => {
        const { result } = renderHook(() => use(LocaleContext));

        expect(result.current).toBe('en-US');
    });

    it('uses context with custom locale', () => {
        const { result } = renderHook(() => use(LocaleContext), {
            wrapper: ({ children }: PropsWithChildren) => <LocaleContext value="de-DE">{children}</LocaleContext>,
        });

        expect(result.current).toBe('de-DE');
    });
});
