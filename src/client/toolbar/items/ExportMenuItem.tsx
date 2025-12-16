import { NavLink } from '@mantine/core';
import { IconCloudDownload } from '@tabler/icons-react';
import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { ToolbarMenuIcon } from '~/client/toolbar/ToolbarMenuIcon';

interface ExportMenuItemProps {
    onClick?: React.MouseEventHandler;
}

export function ExportMenuItem({ onClick }: ExportMenuItemProps) {
    const [, setActive] = useActiveContent();

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
                    <IconCloudDownload />
                </ToolbarMenuIcon>
            }
            onClick={handleExportClick}
        />
    );
}
