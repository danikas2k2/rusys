import CategoryIcon from '@icons/Category.svg';
import React from 'react';
import { Label } from '~/client/common/Label';
import { Links } from '~/client/Links';
import { LinkMenuItem, type LinkMenuItemProps } from '~/client/toolbar/items/LinkMenuItem';

export function GroupsItem({ current }: Pick<LinkMenuItemProps, 'current'>) {
    return (
        <LinkMenuItem link={Links.GROUPS} icon={<CategoryIcon />} current={current}>
            <Label>Groups</Label>
        </LinkMenuItem>
    );
}
