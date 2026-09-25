import { MantineProvider, type MantineThemeOverride } from '@mantine/core';
import React from 'react';

import { getTheme } from '~/styles/theme';

export function MockTheme({
    theme,
    children,
}: React.PropsWithChildren<{
    theme?: MantineThemeOverride;
}>): React.ReactElement {
    return (
        <MantineProvider theme={theme ?? getTheme()} withGlobalClasses={false} withCssVariables={false} env="test">
            {children}
        </MantineProvider>
    );
}
