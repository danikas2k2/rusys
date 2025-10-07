import React from 'react';

import { Page } from '~/client/app/common/Page';
import { DetailsContent } from '~/client/app/details/DetailsContent';
import { GroupFilterContextWrapper } from '~/client/app/filters/GroupFilterContext';
import { QuickFilterContextWrapper } from '~/client/app/filters/QuickFilterContext';
import { ToolbarGroupFilter } from '~/client/app/toolbar/ToolbarGroupFilter';

export function DetailsPage() {
    return (
        <GroupFilterContextWrapper>
            <QuickFilterContextWrapper>
                <Page toolbar={<ToolbarGroupFilter />}>
                    <DetailsContent />
                </Page>
            </QuickFilterContextWrapper>
        </GroupFilterContextWrapper>
    );
}
