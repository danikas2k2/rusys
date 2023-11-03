import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, { memo, type ReactNode } from 'react';
import './Table.less';

interface TableProps {
    className?: string;
    header?: ReactNode;
    children: ReactNode;
}

export default memo(function Table({ className, header, children }: TableProps) {
    return (
        <div className={classNames('Table', className)}>
            {header && <div className="Head">{header}</div>}
            <div className="Body">{children}</div>
        </div>
    );
}, isEqual);
