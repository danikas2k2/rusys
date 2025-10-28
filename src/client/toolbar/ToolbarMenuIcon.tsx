import React from 'react';

import { ThemeIcon } from '@mantine/core';

export function ToolbarMenuIcon({ children }: React.PropsWithChildren): React.ReactElement {
    return (
        <ThemeIcon variant="subtle" styles={{ root: { backgroundColor: 'transparent' } }}>
            {children}
        </ThemeIcon>
    );
}
