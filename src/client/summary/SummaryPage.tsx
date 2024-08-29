import React from 'react';
import { Page } from '~/client/common/Page';
import { SummaryTable } from '~/client/summary/SummaryTable';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';

export function SummaryPage() {
    return (
        <Page toolbar={<ToolbarGroupFilter />}>
            <SummaryTable />
        </Page>
    );
}
