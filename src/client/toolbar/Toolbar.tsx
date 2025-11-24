import React from 'react';

import { ToolbarFilter } from '~/client/toolbar/ToolbarFilter';
import { ToolbarMenu } from '~/client/toolbar/ToolbarMenu';
import { LogoutButton } from '~/client/user/LogoutButton';
import cx from './Toolbar.pcss';

export function Toolbar({ children }: React.PropsWithChildren) {
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
