import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';
import { useYearFilter, YearFilterWrapper } from '~/client/filters/YearFilterContext';
import { Page } from '~/client/pages/common/Page';
import { HistoryContent } from '~/client/pages/history/HistoryContent';
import { HistorySwipeControls } from '~/client/pages/history/HistorySwipeControls';
import { useGetHistory } from '~/client/pages/history/hooks/useGetHistory';
import { useDeleteHistoryEntry } from '~/client/pages/history/hooks/useDeleteHistoryEntry';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import { ToolbarYearFilter } from '~/client/toolbar/ToolbarYearFilter';
import type { ProductUpdateHistoryItem } from '~/types/data';

export function HistoryPage() {
    const [, setActive] = useActiveContent<ProductUpdateHistoryItem>();
    const [year] = useYearFilter();
    const { history, loading, error, reload } = useGetHistory(year);
    const deleteHistoryEntry = useDeleteHistoryEntry();

    const handleDelete = useCallback(
        async (item: ProductUpdateHistoryItem) => {
            await deleteHistoryEntry(item);
            setActive(); // close swipe/selection
            await reload();
        },
        [deleteHistoryEntry, reload, setActive]
    );

    return (
        <GroupFilterWrapper>
            <QuickFilterWrapper>
                <YearFilterWrapper>
                    <Page<ProductUpdateHistoryItem>
                        toolbar={
                            <>
                                <ToolbarGroupFilter />
                                <ToolbarYearFilter />
                            </>
                        }
                        onDelete={handleDelete}
                    >
                        <SwipeControlsWrapper>
                            <HistoryContent history={history} loading={loading} error={error} reload={reload} />
                            <HistorySwipeControls />
                        </SwipeControlsWrapper>
                    </Page>
                </YearFilterWrapper>
            </QuickFilterWrapper>
        </GroupFilterWrapper>
    );
}
