import { isEqual } from 'lodash';
import React, { memo } from 'react';
import { useLocation } from 'react-router';
import { Links } from '~/client/Links';
import DetailsMenu from '~/client/toolbar/DetailsMenu';
import SummaryMenu from '~/client/toolbar/SummaryMenu';
import type ToolbarMenuWrapper from '~/client/toolbar/ToolbarMenuWrapper';

const MenuMap: Record<Links, typeof ToolbarMenuWrapper> = {
    [Links.DETAILS]: DetailsMenu,
    [Links.SUMMARY]: SummaryMenu,
};

export default memo(function ToolbarMenu() {
    const location = useLocation();
    const Menu = MenuMap[location.pathname as Links];
    return Menu ? <Menu /> : null;
}, isEqual);
