import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

export function MockThemeRedux({
    theme,
    state,
    reducers,
    children,
}: React.ComponentProps<typeof MockTheme> & React.ComponentProps<typeof MockRedux>): React.ReactElement {
    return (
        <MockTheme theme={theme}>
            <MockRedux state={state} reducers={reducers}>
                {children}
            </MockRedux>
        </MockTheme>
    );
}
