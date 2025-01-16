import DownloadIcon from '@assets/Download.svg';
import React from 'react';
import { useImportHandler } from '~/client/common/hooks/useImportHandler';
import { Label } from '~/client/common/Label';
import { ToolbarMenuItem } from '~/client/toolbar/ToolbarMenuItem';

export function ImportItem() {
    const handleImport = useImportHandler();
    return (
        <ToolbarMenuItem icon={<DownloadIcon />} onClick={handleImport}>
            <Label>Import</Label>
        </ToolbarMenuItem>
    );
}
