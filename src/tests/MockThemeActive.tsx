import { MockActiveContent } from '@tests/MockActiveContent';
import { MockTheme } from '@tests/MockTheme';

import { type MantineThemeOverride } from '@mantine/core';
import React from 'react';

import type { ActiveContent } from '~/client/common/ActiveContentContext';

export function MockThemeActive<P extends ActiveContent>({
    theme,
    active,
    setActive,
    children,
}: React.PropsWithChildren<{
    theme?: MantineThemeOverride;
    active?: P;
    setActive?: (newState?: P) => void;
}>): React.ReactElement {
    return (
        <MockTheme theme={theme}>
            <MockActiveContent active={active} setActive={setActive}>
                {children}
            </MockActiveContent>
        </MockTheme>
    );
}
