import React from 'react';

import { Page } from '~/client/common/Page';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import { VariantsTable } from '~/client/variants/VariantsTable';

export function VariantsPage() {
    return (
        <Page toolbar={<ToolbarGroupFilter />}>
            <VariantsTable />
        </Page>
    );
}
