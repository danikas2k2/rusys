import React from 'react';

import { Page } from '~/client/common/Page';
import { UpdateTypeContextWrapper } from '~/client/common/UpdateTypeContext';
import { GroupFilterContextWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterContextWrapper } from '~/client/filters/QuickFilterContext';
import { SummaryTable } from '~/client/pages/summary/SummaryTable';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import cx from './SummaryPage.pcss';

export function SummaryPage() {
    return (
        <GroupFilterContextWrapper>
            <QuickFilterContextWrapper>
                <Page toolbar={<ToolbarGroupFilter />} className={cx('SummaryPage')}>
                    <UpdateTypeContextWrapper>
                        <SummaryTable />
                    </UpdateTypeContextWrapper>
                </Page>
            </QuickFilterContextWrapper>
        </GroupFilterContextWrapper>
    );
}
