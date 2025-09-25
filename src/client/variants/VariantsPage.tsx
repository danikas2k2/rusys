import React from 'react';

import { Page } from '~/client/common/Page';
import { GroupFilterContextWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterContextWrapper } from '~/client/filters/QuickFilterContext';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import { VariantsTable } from '~/client/variants/VariantsTable';

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
