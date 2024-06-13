import FilterIcon from '@icons/Filter.svg';
import React from 'react';
import { Label } from '~/client/common/Label';
import { Links } from '~/client/Links';
import { LinkMenuItem, type LinkMenuItemProps } from '~/client/toolbar/items/LinkMenuItem';

export function VariantsItem({ current }: Pick<LinkMenuItemProps, 'current'>) {
    return (
        <LinkMenuItem link={Links.VARIANTS} icon={<FilterIcon />} current={current}>
            <Label>Variants</Label>
        </LinkMenuItem>
    );
}
