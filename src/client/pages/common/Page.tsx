import { AppShell, ScrollArea } from '@mantine/core';
import React from 'react';

import { AppVersion } from '~/client/AppVersion';
import { type ActiveContentData } from '~/client/common/ActiveContentContext';
import { useSwipeVisible } from '~/client/common/hooks/useSwipeVisible';
import { PullToRefreshIndicator } from '~/client/common/PullToRefreshIndicator';
import { RefreshProvider } from '~/client/common/RefreshContext';
import { usePullToRefresh } from '~/client/common/usePullToRefresh';
import { ActiveExportBox } from '~/client/dialogs/ActiveExportBox';
import { ActiveImportBox } from '~/client/dialogs/ActiveImportBox';
import { ActiveContentOutsideClick } from '~/client/pages/common/ActiveContentOutsideClick';
import { ActiveRemoveConfirmation } from '~/client/pages/common/ActiveRemoveConfirmation';
import { AddAction } from '~/client/pages/common/AddAction';
import { ActiveReviewBox } from '~/client/pages/review/ActiveReviewBox';
import { Toolbar } from '~/client/toolbar/Toolbar';

import './Page.pcss';

function PageContent<D = ActiveContentData>({
    withAdd,
    onAdd,
    onDelete,
    toolbar,
    children,
}: React.PropsWithChildren<{
    toolbar?: React.ReactNode;
    withAdd?: boolean;
    onAdd?: React.MouseEventHandler;
    onDelete?: (data: D) => void | Promise<void>;
}>): React.ReactElement {
    const { mainRef, distance, refreshing, dragging } = usePullToRefresh();

    return (
        <AppShell>
            <AppShell.Header>
                <Toolbar>{toolbar}</Toolbar>
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
