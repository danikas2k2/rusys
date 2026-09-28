import React from 'react';

import { ToolbarFilter } from '~/components/toolbar/ToolbarFilter';
import { ToolbarMenu } from '~/components/toolbar/ToolbarMenu';
import { ToolbarReviewButton } from '~/components/toolbar/ToolbarReviewButton';
import { LogoutButton } from '~/components/user/LogoutButton';

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
