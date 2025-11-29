import React from 'react';

import { ActiveContentContext, type ActiveContent } from '~/client/common/ActiveContentContext';

export function MockActiveContent<P extends ActiveContent>({
    active,
    setActive = vi.fn(),
    children,
}: React.PropsWithChildren<{
    active?: P;
    setActive?: (newState?: P) => void;
}>): React.ReactElement {
    return (
        <ActiveContentContext value={[active, setActive as (newState?: ActiveContent) => void]}>
            {children}
        </ActiveContentContext>
    );
}
