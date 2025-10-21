import React from 'react';

import { Page } from '~/client/common/Page';
import { GroupFilterContextWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterContextWrapper } from '~/client/filters/QuickFilterContext';
import { VariantBox } from '~/client/pages/variants/dialogs/VariantBox';
import { VariantsTable } from '~/client/pages/variants/VariantsTable';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';

export function VariantsPage() {
    return (
        <GroupFilterContextWrapper>
            <QuickFilterContextWrapper>
                <Page toolbar={<ToolbarGroupFilter />} addBox={<VariantBox />}>
                    <VariantsTable />
                </Page>
            </QuickFilterContextWrapper>
        </GroupFilterContextWrapper>
    );
}
