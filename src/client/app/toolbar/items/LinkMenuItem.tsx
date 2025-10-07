import React, { useCallback, type PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';

import { type Links } from '~/client/app/Links';
import { ToolbarMenuItem, type ToolbarMenuItemProps } from '~/client/app/toolbar/ToolbarMenuItem';

export interface LinkMenuItemProps extends Omit<ToolbarMenuItemProps, 'onClick'> {
    link: Links;
}

export function LinkMenuItem({ link, icon, color, current, children }: PropsWithChildren<LinkMenuItemProps>) {
    const navigate = useNavigate();
    const gotoLink = useCallback(() => navigate(link), [link, navigate]);
    return (
        <ToolbarMenuItem onClick={gotoLink} icon={icon} color={color} current={current}>
            {children}
        </ToolbarMenuItem>
    );
}
