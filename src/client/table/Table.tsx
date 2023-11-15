import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, { memo, type ReactNode } from 'react';
import './Table.less';

interface TableProps {
    className?: string;
    header?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
}

export default memo(function Table({ className, header, footer, children }: TableProps) {
    return (
        <div role="table" className={classNames('Table', className)}>
            {header && (
                <div role="rowgroup" className="Head">
                    {header}
                </div>
            )}
            <div role="rowgroup" className="Body">
                {children}
            </div>
            {footer && (
                <div role="rowgroup" className="Foot">
                    {footer}
                </div>
            )}
        </div>
    );
}, isEqual);
