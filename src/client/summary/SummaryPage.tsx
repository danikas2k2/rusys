import React from 'react';
import { Page } from '~/client/common/Page';
import { RecycledContextWrapper } from '~/client/common/RecycledContext';
import { RecycledControls } from '~/client/common/RecycledControls';
import { SummaryTable } from '~/client/summary/SummaryTable';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import cx from './SummaryPage.pcss';

export function SummaryPage() {
    return (
        <Page toolbar={<ToolbarGroupFilter />} className={cx('SummaryPage')}>
            <RecycledContextWrapper>
                <div className={cx('controls')}>
                    <RecycledControls />
                </div>
                <SummaryTable />
            </RecycledContextWrapper>
        </Page>
    );
}
