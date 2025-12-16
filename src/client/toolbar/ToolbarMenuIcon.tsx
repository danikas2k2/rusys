import { ThemeIcon } from '@mantine/core';
import React from 'react';

export function ToolbarMenuIcon({ children }: React.PropsWithChildren): React.ReactElement {
    return (
        <ThemeIcon variant="subtle" styles={{ root: { backgroundColor: 'transparent' } }}>
            {children}
        </ThemeIcon>
    );
}
