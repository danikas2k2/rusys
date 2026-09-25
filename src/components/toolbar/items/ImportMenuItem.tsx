import { NavLink } from '@mantine/core';
import React, { useCallback } from 'react';

import { ImportIcon } from '@icons';

import { Label } from '~/components/common/Label';
import { useSetActiveContent } from '~/components/runtime/ActiveContentContext';
import { ToolbarMenuIcon } from '~/components/toolbar/ToolbarMenuIcon';

interface ImportMenuItemProps {
    onClick?: React.MouseEventHandler;
}

export function ImportMenuItem({ onClick }: ImportMenuItemProps) {
    const setActive = useSetActiveContent();

    const handleImportClick = useCallback(
        (e: React.MouseEvent) => {
            onClick?.(e);
            setActive({ action: 'import' });
        },
        [onClick, setActive]
    );

    return (
        <NavLink
            label={<Label>Import</Label>}
            leftSection={
                <ToolbarMenuIcon>
                    <ImportIcon />
                </ToolbarMenuIcon>
            }
            onClick={handleImportClick}
        />
    );
}
