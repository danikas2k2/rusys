import React, { type HTMLAttributes, type ReactNode } from 'react';

import cx from './Cell.pcss';

interface CellProps<T extends HTMLElement = HTMLDivElement> extends HTMLAttributes<T> {
    children?: ReactNode;
}

export function Cell({ role = 'cell', className, children, ...other }: CellProps) {
    return (
        <div role={role} className={cx('Cell', className)} {...other}>
            {children}
        </div>
    );
}
