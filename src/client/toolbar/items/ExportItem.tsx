import UploadIcon from '@assets/Upload.svg';
import React from 'react';
import { useExportHandler } from '~/client/common/hooks/useExportHandler';
import { Label } from '~/client/common/Label';
import { ToolbarMenuItem } from '~/client/toolbar/ToolbarMenuItem';

export function ExportItem() {
    const handleExport = useExportHandler();
    return (
        <ToolbarMenuItem icon={<UploadIcon />} onClick={handleExport}>
            <Label>Export</Label>
        </ToolbarMenuItem>
    );
}
