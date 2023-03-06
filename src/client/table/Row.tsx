import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';
import React, { memo } from 'react';
import './Row.less';

interface RowProps<T extends HTMLElement = HTMLDivElement> extends HTMLAttributes<T> {
    children: ReactNode;
}

export default memo(function Row({ role = 'row', className, children, ...other }: RowProps): JSX.Element {
    return (
        <div role={role} className={classNames('Row', className)} {...other}>
            {children}
        </div>
    );
});
