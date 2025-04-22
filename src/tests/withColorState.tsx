import React, { type JSX, type PropsWithChildren } from 'react';
import { type RenderHookOptions } from '@testing-library/react';
import { ColorSchemeState } from '@ui/ColorScheme';

export function withColorState<P>(): RenderHookOptions<P> {
    return {
        wrapper: ({ children }: PropsWithChildren): JSX.Element => <ColorSchemeState>{children}</ColorSchemeState>,
    };
}
