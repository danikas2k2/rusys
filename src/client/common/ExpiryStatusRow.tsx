import type { ExpiryStatus } from '@rusys/common/utils/expiry';
import React from 'react';

import { ExpiredIcon, ExpiringSoonIcon } from '@icons';

export interface ExpiryStatusRowProps {
    status: ExpiryStatus | undefined;
    children: React.ReactNode;
}

export function ExpiryStatusRow({ status, children }: ExpiryStatusRowProps) {
    return (
        <span data-amounts-row data-expires={status}>
            {status === 'soon' && <ExpiringSoonIcon size={12} />}
            {status === 'expired' && <ExpiredIcon size={12} />}
            {children}
        </span>
    );
}
