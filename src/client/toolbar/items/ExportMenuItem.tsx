import { NavLink } from '@mantine/core';
import React, { useCallback } from 'react';

import { ExportIcon } from '@icons';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { ToolbarMenuIcon } from '~/client/toolbar/ToolbarMenuIcon';

interface ExportMenuItemProps {
    onClick?: React.MouseEventHandler;
}

export function ExportMenuItem({ onClick }: ExportMenuItemProps) {
    const setActive = useSetActiveContent();

    const handleExportClick = useCallback(
        (e: React.MouseEvent) => {
            onClick?.(e);
            setActive({ action: 'export' });
        },
        [onClick, setActive]
    );

    return (
        <NavLink
            label={<Label>Export</Label>}
            leftSection={
                <ToolbarMenuIcon>
                    <ExportIcon />
                </ToolbarMenuIcon>
            }
            onClick={handleExportClick}
        />
    );
}
