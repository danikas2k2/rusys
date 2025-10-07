import React from 'react';

import { Page } from '~/client/app/common/Page';
import { GroupFilterContextWrapper } from '~/client/app/filters/GroupFilterContext';
import { QuickFilterContextWrapper } from '~/client/app/filters/QuickFilterContext';
import { ToolbarGroupFilter } from '~/client/app/toolbar/ToolbarGroupFilter';
import { VariantsTable } from '~/client/app/variants/VariantsTable';

export function VariantsPage() {
    return (
        <GroupFilterContextWrapper>
            <QuickFilterContextWrapper>
                <Page toolbar={<ToolbarGroupFilter />}>
                    <VariantsTable />
                </Page>
            </QuickFilterContextWrapper>
        </GroupFilterContextWrapper>
    );
}
