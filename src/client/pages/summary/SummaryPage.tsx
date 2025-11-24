import React from 'react';

import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';
import { Page } from '~/client/pages/common/Page';
import { SummaryTable } from '~/client/pages/summary/SummaryTable';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';

export function SummaryPage() {
    return (
        <GroupFilterWrapper>
            <QuickFilterWrapper>
                <Page toolbar={<ToolbarGroupFilter />}>
                    <UpdateTypeWrapper>
                        <SummaryTable />
                    </UpdateTypeWrapper>
                </Page>
            </QuickFilterWrapper>
        </GroupFilterWrapper>
    );
}
