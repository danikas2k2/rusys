import React, { type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import cx from './Row.less';

export interface RowProps<T extends HTMLElement = HTMLDivElement> extends HTMLAttributes<T> {
    children?: ReactNode;
}

export const Row = forwardRef(function Row(
    { role = 'row', className, children, ...other }: RowProps,
    forwardedRef: ForwardedRef<HTMLDivElement>
) {
    return (
        <div ref={forwardedRef} role={role} className={cx('Row', className)} {...other}>
            {children}
        </div>
    );
});
