import React from 'react';

import { ExpiredIcon, ExpiringSoonIcon } from '@icons';

import type { ExpiryStatus } from '~/common/utils/expiry';

export interface ExpiryStatusRowProps {
    status: ExpiryStatus | undefined;
    children: React.ReactNode;
}

// One row of values sharing a single expiry status - the status icon is shown once, in front of
// the whole row, rather than repeated next to every individual value.
export function ExpiryStatusRow({ status, children }: ExpiryStatusRowProps) {
    return (
        <span data-amounts-row data-expiry-status={status}>
            {status === 'soon' && <ExpiringSoonIcon size={12} />}
            {status === 'expired' && <ExpiredIcon size={12} />}
            {children}
        </span>
    );
}
