import React from 'react';

import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { Page } from '~/client/pages/common/Page';
import { SummaryTable } from '~/client/pages/summary/SummaryTable';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';

export function SummaryPage() {
    return (
        <Page toolbar={<ToolbarGroupFilter />}>
            <UpdateTypeWrapper>
                <SummaryTable />
            </UpdateTypeWrapper>
        </Page>
    );
}
