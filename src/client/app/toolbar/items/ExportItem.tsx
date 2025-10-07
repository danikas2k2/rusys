import ExportIcon from '@assets/export.svg';

import React, { useCallback } from 'react';

import { useExportHandler } from '~/client/app/common/hooks/useExportHandler';
import { Label } from '~/client/app/common/Label';
import { ToolbarMenuItem } from '~/client/app/toolbar/ToolbarMenuItem';

export function ExportItem({ onClick }: { onClick: () => void }) {
    const handleExport = useExportHandler();
    const handleClick = useCallback(async () => {
        await handleExport();
        onClick?.();
    }, [handleExport, onClick]);
    return (
        <ToolbarMenuItem icon={<ExportIcon />} onClick={handleClick}>
            <Label>Export</Label>
        </ToolbarMenuItem>
    );
}
