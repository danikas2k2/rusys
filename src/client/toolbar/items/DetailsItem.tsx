import ListAltIcon from '@assets/list-alt.svg';
import React from 'react';
import { Label } from '~/client/common/Label';
import { Links } from '~/client/Links';
import { LinkMenuItem, type LinkMenuItemProps } from '~/client/toolbar/items/LinkMenuItem';

export function DetailsItem({ current }: Pick<LinkMenuItemProps, 'current'>) {
    return (
        <LinkMenuItem link={Links.DETAILS} icon={<ListAltIcon />} color="primary" current={current}>
            <Label>List</Label>
        </LinkMenuItem>
    );
}
