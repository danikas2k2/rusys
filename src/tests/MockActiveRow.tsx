import React, { type JSX, type PropsWithChildren } from 'react';

import { ActiveRowContext, type ActiveRow } from '~/client/app/common/ActiveRowContext';

export function MockActiveRow<P extends ActiveRow>({
    state,
    setState = jest.fn(),
    children,
}: PropsWithChildren<{
    state?: P;
    setState?: (newState?: P) => void;
}>): JSX.Element {
    return <ActiveRowContext value={[state, setState as (newState?: ActiveRow) => void]}>{children}</ActiveRowContext>;
}
