import React from 'react';
import { Page } from '~/client/common/Page';
import { DetailsTable } from '~/client/details/DetailsTable';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';

export function DetailsPage() {
    return (
        <Page toolbar={<ToolbarGroupFilter />}>
            <DetailsTable />
        </Page>
    );
}
