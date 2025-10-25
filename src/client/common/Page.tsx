import React, { type PropsWithChildren, type ReactNode } from 'react';

import { AppShell, ScrollArea } from '@mantine/core';

import { AddAction } from '~/client/common/AddAction';
import { AppVersion } from '~/client/common/AppVersion';
import { Toolbar } from '~/client/toolbar/Toolbar';
import type { ToolbarMenuProps } from '~/client/toolbar/ToolbarMenu';
import cx from './Page.pcss';

interface PageProps extends PropsWithChildren<ToolbarMenuProps> {
    className?: string;
    toolbar?: ReactNode;
    onAdd?: () => void;
}

export function Page({ addBox, onAdd, toolbar, children }: PageProps) {
    return (
        <AppShell className={cx('Page')}>
            <AppShell.Header className={cx('header')}>
                <Toolbar addBox={addBox}>{toolbar}</Toolbar>
            </AppShell.Header>
            <AppShell.Main className={cx('main')} component={ScrollArea}>
                {children}
            </AppShell.Main>
            <AppShell.Footer className={cx('footer')}>
                <AppVersion />
                {onAdd && <AddAction onClick={onAdd} />}
            </AppShell.Footer>
        </AppShell>
    );
}
