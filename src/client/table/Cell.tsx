import { isEqual } from 'lodash';
import React, { type HTMLAttributes, memo, type ReactNode } from 'react';
import cx from './Cell.less';

interface CellProps<T extends HTMLElement = HTMLDivElement> extends HTMLAttributes<T> {
    children?: ReactNode;
}

export default memo(function Cell({ role = 'cell', className, children, ...other }: CellProps) {
    return (
        <div role={role} className={cx('Cell', className)} {...other}>
            {children}
        </div>
    );
}, isEqual);
