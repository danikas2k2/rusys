import React from 'react';

import { Page } from '~/client/common/Page';
import { DetailsContent } from '~/client/details/DetailsContent';
import { GroupFilterContextWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterContextWrapper } from '~/client/filters/QuickFilterContext';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';

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
