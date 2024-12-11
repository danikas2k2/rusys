import { type RenderHookOptions } from '@testing-library/react';
import React, { type PropsWithChildren } from 'react';
import { LocaleContext } from '~/client/common/LocaleContext';

export function withLocaleContext<P>(locale?: string): RenderHookOptions<P> {
    return {
        wrapper: ({ children }: PropsWithChildren) => <LocaleContext value={locale}>{children}</LocaleContext>,
    };
}
