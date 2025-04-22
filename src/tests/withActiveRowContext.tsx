import React, { type PropsWithChildren } from 'react';
import { type RenderHookOptions } from '@testing-library/react';
import { ActiveRowContext, type ActiveRow } from '~/client/common/ActiveRowContext';

export function withActiveRowContext<P extends ActiveRow>(
    state?: P,
    setState: (newState?: P) => void = jest.fn()
): RenderHookOptions<P> {
    return {
        wrapper: ({ children }: PropsWithChildren) => (
            <ActiveRowContext value={[state, setState as (newState?: ActiveRow) => void]}>{children}</ActiveRowContext>
        ),
    };
}
