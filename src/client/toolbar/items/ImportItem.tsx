import DownloadIcon from '@assets/download.svg';
import React from 'react';
import { Label } from '~/client/common/Label';
import { ToolbarMenuItem } from '~/client/toolbar/ToolbarMenuItem';

export function ImportItem({ onClick }: { onClick: () => void }) {
    return (
        <ToolbarMenuItem icon={<DownloadIcon />} onClick={onClick}>
            <Label>Import</Label>
        </ToolbarMenuItem>
    );
}
