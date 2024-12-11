import React, { type HTMLAttributes, type ReactNode, type RefAttributes } from 'react';
import cx from './Table.less';

interface TableProps extends HTMLAttributes<HTMLDivElement>, RefAttributes<HTMLDivElement> {
    className?: string;
    header?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
}

export function Table({ className, header, footer, children, ...props }: TableProps) {
    return (
        <div role="table" className={cx('Table', className)} {...props}>
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
}
