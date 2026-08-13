import React from 'react';

import { ToolbarFilter } from '~/client/toolbar/ToolbarFilter';
import { ToolbarMenu } from '~/client/toolbar/ToolbarMenu';
import { ToolbarReviewButton } from '~/client/toolbar/ToolbarReviewButton';
import { LogoutButton } from '~/client/user/LogoutButton';

import './Toolbar.pcss';

export function Toolbar({
    children,
    alignWithCategoryRail = false,
}: React.PropsWithChildren<{ alignWithCategoryRail?: boolean }>) {
    return (
        <div className="Toolbar" data-align-category-rail={alignWithCategoryRail || undefined}>
            <div>
                <ToolbarMenu />
            </div>
            <div className="filter">
                <ToolbarFilter />
                {children}
            </div>
            <div>
                <ToolbarReviewButton />
            </div>
            <div>
                <LogoutButton />
            </div>
        </div>
    );
}
