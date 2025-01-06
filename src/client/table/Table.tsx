import { isEqual } from 'lodash';
import React, { memo, type ReactNode } from 'react';
import cx from './Table.less';

interface TableProps {
    className?: string;
    header?: ReactNode;
    children: ReactNode;
}

export default memo(function Table({ className, header, children }: TableProps) {
    return (
        <div className={cx('Table', className)}>
            {header && <div className={cx('Head')}>{header}</div>}
            <div className={cx('Body')}>{children}</div>
        </div>
    );
}, isEqual);
