import React, { type ReactNode } from 'react';

import cs from 'classnames';

import { Toolbar } from '~/client/toolbar/Toolbar';
import cx from './Page.pcss';

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
