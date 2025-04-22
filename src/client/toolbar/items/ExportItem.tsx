import React, { useCallback } from 'react';
import UploadIcon from '@assets/upload.svg';
import { useExportHandler } from '~/client/common/hooks/useExportHandler';
import { Label } from '~/client/common/Label';
import { ToolbarMenuItem } from '~/client/toolbar/ToolbarMenuItem';

export function ExportItem({ onClick }: { onClick: () => void }) {
    const handleExport = useExportHandler();
    const handleClick = useCallback(() => {
        handleExport();
        onClick?.();
    }, [handleExport, onClick]);
    return (
        <ToolbarMenuItem icon={<UploadIcon />} onClick={handleClick}>
            <Label>Export</Label>
        </ToolbarMenuItem>
    );
}
