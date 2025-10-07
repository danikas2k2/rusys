import CategoryIcon from '@assets/category.svg';

import React from 'react';

import { Label } from '~/client/app/common/Label';
import { Links } from '~/client/app/Links';
import { LinkMenuItem, type LinkMenuItemProps } from '~/client/app/toolbar/items/LinkMenuItem';

export function GroupsItem({ current }: Pick<LinkMenuItemProps, 'current'>) {
    return (
        <LinkMenuItem link={Links.GROUPS} icon={<CategoryIcon />} current={current}>
            <Label>Groups</Label>
        </LinkMenuItem>
    );
}
