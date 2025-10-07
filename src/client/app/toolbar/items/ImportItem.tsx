import DownloadIcon from '@assets/download.svg';

import React from 'react';

import { Label } from '~/client/app/common/Label';
import { ToolbarMenuItem } from '~/client/app/toolbar/ToolbarMenuItem';

export function ImportItem({ onClick }: { onClick: () => void }) {
    return (
        <ToolbarMenuItem icon={<DownloadIcon />} onClick={onClick}>
            <Label>Import</Label>
        </ToolbarMenuItem>
    );
}
