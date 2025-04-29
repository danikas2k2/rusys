import React from 'react';
import { Page } from '~/client/common/Page';
import { DetailsContent } from '~/client/details/DetailsContent';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';

export function DetailsPage() {
    return (
        <Page toolbar={<ToolbarGroupFilter />}>
            <DetailsContent />
        </Page>
    );
}
