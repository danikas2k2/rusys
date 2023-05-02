import classNames from 'classnames';
import React, { type HTMLAttributes, memo, type ReactNode } from 'react';
import './Cell.less';

interface CellProps<T extends HTMLElement = HTMLDivElement> extends HTMLAttributes<T> {
    children?: ReactNode;
}

export default memo(function Cell({ role = 'cell', className, children, ...other }: CellProps): JSX.Element {
    return (
        <div role={role} className={classNames('Cell', className)} {...other}>
            {children}
        </div>
    );
});
