import React, { useCallback } from 'react';
import ExportIcon from '@assets/export.svg';
import { useExportHandler } from '~/client/common/hooks/useExportHandler';
import { Label } from '~/client/common/Label';
import { ToolbarMenuItem } from '~/client/toolbar/ToolbarMenuItem';

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
