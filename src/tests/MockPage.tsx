import { MockRoute } from '@tests/MockRoute';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import React from 'react';

export function MockPage({
    theme,
    state,
    reducers,
    initialEntries,
    children,
}: React.ComponentProps<typeof MockThemeRedux> & React.ComponentProps<typeof MockRoute>): React.ReactElement {
    return (
        <MockThemeRedux theme={theme} state={state} reducers={reducers}>
            <MockRoute initialEntries={initialEntries}>{children}</MockRoute>
        </MockThemeRedux>
    );
}
