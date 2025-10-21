import React, { type PropsWithChildren, type ReactNode } from 'react';

import cs from 'classnames';

import { Toolbar } from '~/client/toolbar/Toolbar';
import type { ToolbarMenuProps } from '~/client/toolbar/ToolbarMenu';
import cx from './Page.pcss';

interface PageProps extends PropsWithChildren<ToolbarMenuProps> {
    className?: string;
    toolbar?: ReactNode;
}

export function Page({ className, addBox, toolbar, children }: PageProps) {
    return (
        <div className={cs(cx('Page'), className)}>
            <Toolbar addBox={addBox}>{toolbar}</Toolbar>
            {children}
        </div>
    );
}
