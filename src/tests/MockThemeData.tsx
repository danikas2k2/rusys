import { MockData } from '@tests/MockData';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

export function MockThemeData({
    theme,
    state,
    children,
}: React.ComponentProps<typeof MockTheme> & React.ComponentProps<typeof MockData>): React.ReactElement {
    return (
        <MockTheme theme={theme}>
            <MockData state={state}>{children}</MockData>
        </MockTheme>
    );
}
