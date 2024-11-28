import { type RenderHookOptions } from '@testing-library/react';
import { ColorSchemeState } from '@ui/ColorScheme';
import React, { type JSX, type PropsWithChildren } from 'react';

export function withColorState<P>(): RenderHookOptions<P> {
    return {
        wrapper: ({ children }: PropsWithChildren): JSX.Element => <ColorSchemeState>{children}</ColorSchemeState>,
    };
}
