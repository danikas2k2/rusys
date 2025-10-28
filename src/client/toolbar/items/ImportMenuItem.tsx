import React, { useCallback } from 'react';

import { NavLink } from '@mantine/core';
import { IconCloudUpload } from '@tabler/icons-react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { ToolbarMenuIcon } from '~/client/toolbar/ToolbarMenuIcon';

interface ImportMenuItemProps {
    onClick?: React.MouseEventHandler;
}

export function ImportMenuItem({ onClick }: ImportMenuItemProps) {
    const [, setActive] = useActiveContent();

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
                    <IconCloudUpload />
                </ToolbarMenuIcon>
            }
            onClick={handleImportClick}
        />
    );
}
