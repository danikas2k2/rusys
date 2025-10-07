import React, { type PropsWithChildren } from 'react';

import { ToolbarFilter } from '~/client/app/toolbar/ToolbarFilter';
import { ToolbarMenu } from '~/client/app/toolbar/ToolbarMenu';
import { LogoutButton } from '~/client/app/user/LogoutButton';
import cx from './Toolbar.pcss';

export function Toolbar({ children }: PropsWithChildren<object>) {
    return (
        <div className={cx('Toolbar')}>
            <div>
                <ToolbarMenu />
            </div>
            <div className={cx('filter')}>
                <ToolbarFilter />
                {children}
            </div>
            <div className={cx('icon')}>
                <LogoutButton />
            </div>
        </div>
    );
}
