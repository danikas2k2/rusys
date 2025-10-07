import ListAltIcon from '@assets/list-alt.svg';

import React from 'react';

import { Label } from '~/client/app/common/Label';
import { Links } from '~/client/app/Links';
import { LinkMenuItem, type LinkMenuItemProps } from '~/client/app/toolbar/items/LinkMenuItem';

export function DetailsItem({ current }: Pick<LinkMenuItemProps, 'current'>) {
    return (
        <LinkMenuItem link={Links.DETAILS} icon={<ListAltIcon />} color="blue" current={current}>
            <Label>List</Label>
        </LinkMenuItem>
    );
}
