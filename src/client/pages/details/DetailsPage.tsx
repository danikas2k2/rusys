import React from 'react';

import { Page } from '~/client/common/Page';
import { GroupFilterContextWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterContextWrapper } from '~/client/filters/QuickFilterContext';
import { DetailsContent } from '~/client/pages/details/DetailsContent';
import { DetailsBox } from '~/client/pages/details/dialogs/DetailsBox';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';

export function DetailsPage() {
    return (
        <GroupFilterContextWrapper>
            <QuickFilterContextWrapper>
                <Page toolbar={<ToolbarGroupFilter />} addBox={<DetailsBox />}>
                    <DetailsContent />
                </Page>
            </QuickFilterContextWrapper>
        </GroupFilterContextWrapper>
    );
}
