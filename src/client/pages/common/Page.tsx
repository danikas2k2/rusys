import React from 'react';

import { AppShell, ScrollArea } from '@mantine/core';

import { AppVersion } from '~/client/AppVersion';
import { type ActiveContentData } from '~/client/common/ActiveContentContext';
import { useSwipeVisible } from '~/client/common/hooks/useSwipeVisible';
import { ActiveExportBox } from '~/client/dialogs/ActiveExportBox';
import { ActiveImportBox } from '~/client/dialogs/ActiveImportBox';
import { ActiveContentOutsideClick } from '~/client/pages/common/ActiveContentOutsideClick';
import { ActiveRemoveConfirmation } from '~/client/pages/common/ActiveRemoveConfirmation';
import { AddAction } from '~/client/pages/common/AddAction';
import { Toolbar } from '~/client/toolbar/Toolbar';
import cx from './Page.pcss';

export function Page<D = ActiveContentData>({
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
    return (
        <AppShell className={cx('Page')}>
            <AppShell.Header className={cx('header')}>
                <Toolbar>{toolbar}</Toolbar>
            </AppShell.Header>
            <AppShell.Main className={cx('main')} data-no-scroll={useSwipeVisible()} component={ScrollArea}>
                {children}
            </AppShell.Main>
            <AppShell.Footer className={cx('footer')}>
                <AppVersion />
                {withAdd && <AddAction onClick={onAdd} />}
            </AppShell.Footer>
            <ActiveContentOutsideClick />
            {onDelete && <ActiveRemoveConfirmation onConfirm={onDelete} />}
            <ActiveExportBox />
            <ActiveImportBox />
        </AppShell>
    );
}
