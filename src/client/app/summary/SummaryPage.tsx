import React from 'react';

import { Page } from '~/client/app/common/Page';
import { UpdateTypeContextWrapper } from '~/client/app/common/UpdateTypeContext';
import { GroupFilterContextWrapper } from '~/client/app/filters/GroupFilterContext';
import { QuickFilterContextWrapper } from '~/client/app/filters/QuickFilterContext';
import { SummaryTable } from '~/client/app/summary/SummaryTable';
import { ToolbarGroupFilter } from '~/client/app/toolbar/ToolbarGroupFilter';
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
