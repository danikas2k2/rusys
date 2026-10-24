import { MockActiveContent } from '@tests/MockActiveContent';
import { MockPage } from '@tests/MockPage';

import React from 'react';

export function MockApp({
    theme,
    state,
    initialEntries,
    active,
    setActive,
    children,
}: React.ComponentProps<typeof MockPage> & {
    active?: React.ComponentProps<typeof MockActiveContent>['active'];
    setActive?: React.ComponentProps<typeof MockActiveContent>['setActive'];
}): React.ReactElement {
    return (
        <MockPage theme={theme} state={state} initialEntries={initialEntries}>
            <MockActiveContent active={active} setActive={setActive}>
                {children}
            </MockActiveContent>
        </MockPage>
    );
}
