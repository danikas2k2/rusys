import cs from 'classnames';
import React, { type ReactNode } from 'react';
import { Toolbar } from '~/client/toolbar/Toolbar';
import cx from './Page.less';

interface PageProps {
    toolbar?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function Page({ toolbar, children, className }: PageProps) {
    return (
        <div className={cs(cx('Page'), className)}>
            <Toolbar>{toolbar}</Toolbar>
            {children}
        </div>
    );
}
