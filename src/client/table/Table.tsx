import React, { type ForwardedRef, forwardRef, type ReactNode } from 'react';
import cx from './Table.less';

interface TableProps {
    className?: string;
    header?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
}

export const Table = forwardRef(function Table(
    { className, header, footer, children }: TableProps,
    forwardedRef: ForwardedRef<HTMLDivElement>
) {
    return (
        <div ref={forwardedRef} role="table" className={cx('Table', className)}>
            {header && (
                <div role="rowgroup" className={cx('Head')}>
                    {header}
                </div>
            )}
            <div role="rowgroup" className={cx('Body')}>
                {children}
            </div>
            {footer && (
                <div role="rowgroup" className={cx('Foot')}>
                    {footer}
                </div>
            )}
        </div>
    );
});
