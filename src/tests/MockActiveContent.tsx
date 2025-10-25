import React, { type JSX, type PropsWithChildren } from 'react';

import { ActiveContentContext, type ActiveContent } from '~/client/common/ActiveContentContext';

export function MockActiveContent<P extends ActiveContent>({
    state,
    setState = jest.fn(),
    children,
}: PropsWithChildren<{
    state?: P;
    setState?: (newState?: P) => void;
}>): JSX.Element {
    return (
        <ActiveContentContext value={[state, setState as (newState?: ActiveContent) => void]}>
            {children}
        </ActiveContentContext>
    );
}
