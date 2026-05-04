import React from 'react';

import { SwipeControls } from '~/client/common/SwipeControls';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';
import { YearFilterWrapper } from '~/client/filters/YearFilterContext';
import { Page } from '~/client/pages/common/Page';
import { ActiveValueBox } from '~/client/pages/history/ActiveValueBox';
import { HistoryTable } from '~/client/pages/history/HistoryTable';
import { UpdatingHistoryWrapper } from '~/client/pages/history/UpdatingHistoryContext';
import { useDeleteHistory } from '~/client/state/history/useDeleteHistory';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import { ToolbarYearFilter } from '~/client/toolbar/ToolbarYearFilter';
import type { History } from '~/types/data';

export function HistoryPage() {
    const deleteHistory = useDeleteHistory();
    const handleDelete = ({ time, group, name, year, user }: History) => {
        if (year === undefined) {
            return;
        }
        return deleteHistory(time, group, name, year, user);
    };

    return (
        <YearFilterWrapper>
            <GroupFilterWrapper>
                <QuickFilterWrapper>
                    <UpdatingHistoryWrapper>
                        <Page
                            toolbar={
                                <>
                                    <ToolbarGroupFilter />
                                    <ToolbarYearFilter />
                                </>
                            }
                            onDelete={handleDelete}
                        >
                            <SwipeControlsWrapper>
                                <HistoryTable />
                                <SwipeControls withEdit={false} />
                            </SwipeControlsWrapper>
                            <ActiveValueBox />
                        </Page>
                    </UpdatingHistoryWrapper>
                </QuickFilterWrapper>
            </GroupFilterWrapper>
        </YearFilterWrapper>
    );
}
