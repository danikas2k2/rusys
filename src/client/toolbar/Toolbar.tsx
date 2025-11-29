import React from 'react';

import { ToolbarFilter } from '~/client/toolbar/ToolbarFilter';
import { ToolbarMenu } from '~/client/toolbar/ToolbarMenu';
import { LogoutButton } from '~/client/user/LogoutButton';

import './Toolbar.pcss';

export function Toolbar({ children }: React.PropsWithChildren) {
    return (
        <div className="Toolbar">
            <div>
                <ToolbarMenu />
            </div>
            <div className="filter">
                <ToolbarFilter />
                {children}
            </div>
            <div>
                <LogoutButton />
            </div>
        </div>
    );
}
