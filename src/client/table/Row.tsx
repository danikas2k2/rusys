import { isEqual } from 'lodash';
import React, { type HTMLAttributes, memo, type ReactNode } from 'react';
import cx from './Row.less';

interface RowProps<T extends HTMLElement = HTMLDivElement> extends HTMLAttributes<T> {
    children: ReactNode;
}

export default memo(function Row({ role = 'row', className, children, ...other }: RowProps) {
    return (
        <div role={role} className={cx('Row', className)} {...other}>
            {children}
        </div>
    );
}, isEqual);
