import { AppShell, ScrollArea } from '@mantine/core';
import React from 'react';

import { AppVersion } from '~/components/app/AppVersion';
import { useSwipeVisible } from '~/components/hooks/useSwipeVisible';
import { type ActiveContentData } from '~/components/runtime/ActiveContentContext';
import { PullToRefreshIndicator } from '~/components/runtime/PullToRefreshIndicator';
import { RefreshProvider } from '~/components/runtime/RefreshContext';
import { usePullToRefresh } from '~/components/runtime/usePullToRefresh';
import { Toolbar } from '~/components/toolbar/Toolbar';
import { ActiveContentOutsideClick } from '~/features/common/ActiveContentOutsideClick';
import { ActiveRemoveConfirmation } from '~/features/common/ActiveRemoveConfirmation';
import { AddAction } from '~/features/common/AddAction';
import { ActiveExportBox } from '~/features/dialogs/ActiveExportBox';
import { ActiveImportBox } from '~/features/dialogs/ActiveImportBox';
import { ActiveReviewBox } from '~/features/review/ActiveReviewBox';

function PageContent<D = ActiveContentData>({
    withAdd,
    onAdd,
    onDelete,
    toolbar,
    alignToolbarWithCategoryRail,
    children,
}: React.PropsWithChildren<{
    toolbar?: React.ReactNode;
    alignToolbarWithCategoryRail?: boolean;
    withAdd?: boolean;
    onAdd?: React.MouseEventHandler;
    onDelete?: (data: D) => void | Promise<void>;
}>): React.ReactElement {
    const { mainRef, distance, refreshing, dragging } = usePullToRefresh();

    return (
        <AppShell>
            <AppShell.Header>
                <Toolbar alignWithCategoryRail={alignToolbarWithCategoryRail}>{toolbar}</Toolbar>
            </AppShell.Header>
            <AppShell.Main ref={mainRef} data-no-scroll={useSwipeVisible()} component={ScrollArea}>
                <PullToRefreshIndicator distance={distance} refreshing={refreshing} dragging={dragging}>
                    {children}
                </PullToRefreshIndicator>
            </AppShell.Main>
            <AppShell.Footer>
                <AppVersion />
                {withAdd && <AddAction onClick={onAdd} />}
            </AppShell.Footer>
            <ActiveContentOutsideClick />
            {onDelete && <ActiveRemoveConfirmation onConfirm={onDelete} />}
            <ActiveExportBox />
            <ActiveImportBox />
            <ActiveReviewBox />
        </AppShell>
    );
}

export function Page<D = ActiveContentData>(
    props: React.PropsWithChildren<{
        toolbar?: React.ReactNode;
        alignToolbarWithCategoryRail?: boolean;
        withAdd?: boolean;
        onAdd?: React.MouseEventHandler;
        onDelete?: (data: D) => void | Promise<void>;
    }>
): React.ReactElement {
    return (
        <RefreshProvider>
            <PageContent {...props} />
        </RefreshProvider>
    );
}
