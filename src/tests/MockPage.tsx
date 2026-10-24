import { MockRoute } from '@tests/MockRoute';
import { MockThemeData } from '@tests/MockThemeData';

import React from 'react';

export function MockPage({
    theme,
    state,
    initialEntries,
    children,
}: React.ComponentProps<typeof MockThemeData> & React.ComponentProps<typeof MockRoute>): React.ReactElement {
    return (
        <MockThemeData theme={theme} state={state}>
            <MockRoute initialEntries={initialEntries}>{children}</MockRoute>
        </MockThemeData>
    );
}
