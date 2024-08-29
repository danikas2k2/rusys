import React, { type ReactNode } from 'react';
import { Toolbar } from '~/client/toolbar/Toolbar';
import cx from './Page.less';

interface PageProps {
    toolbar?: ReactNode;
    children: ReactNode;
}

export function Page({ toolbar, children }: PageProps) {
    return (
        <div className={cx('Page')}>
            <Toolbar>{toolbar}</Toolbar>
            {children}
        </div>
    );
}
