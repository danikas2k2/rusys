import React from 'react';
import { Page } from '~/client/common/Page';
import { UpdateTypeContextWrapper } from '~/client/common/UpdateTypeContext';
import { SummaryTable } from '~/client/summary/SummaryTable';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import cx from './SummaryPage.pcss';

export function SummaryPage() {
    return (
        <Page toolbar={<ToolbarGroupFilter />} className={cx('SummaryPage')}>
            <UpdateTypeContextWrapper>
                <SummaryTable />
            </UpdateTypeContextWrapper>
        </Page>
    );
}
