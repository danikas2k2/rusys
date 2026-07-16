import React from 'react';

import { ActiveContentWrapper } from '~/client/common/ActiveContentContext';
import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { Page } from '~/client/pages/common/Page';
import { ActiveHistoryBox } from '~/client/pages/summary/ActiveHistoryBox';
import { SummaryTable } from '~/client/pages/summary/SummaryTable';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';

export function SummaryPage() {
    return (
        <Page toolbar={<ToolbarGroupFilter />}>
            <ActiveContentWrapper>
                <UpdateTypeWrapper>
                    <SummaryTable />
                </UpdateTypeWrapper>
                <ActiveHistoryBox />
            </ActiveContentWrapper>
        </Page>
    );
}
