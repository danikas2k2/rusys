import React, { type HTMLAttributes, type ReactNode, type RefAttributes } from 'react';

import cx from './Row.pcss';

export interface RowProps<T extends HTMLElement = HTMLDivElement> extends HTMLAttributes<T>, RefAttributes<T> {
    children?: ReactNode;
}

export function Row({ role = 'row', className, children, ...other }: RowProps) {
    return (
        <div role={role} className={cx('Row', className)} {...other}>
            {children}
        </div>
    );
}
