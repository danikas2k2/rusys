import FilterIcon from '@assets/filter.svg';

import React from 'react';

import { Label } from '~/client/app/common/Label';
import { Links } from '~/client/app/Links';
import { LinkMenuItem, type LinkMenuItemProps } from '~/client/app/toolbar/items/LinkMenuItem';

export function VariantsItem({ current }: Pick<LinkMenuItemProps, 'current'>) {
    return (
        <LinkMenuItem link={Links.VARIANTS} icon={<FilterIcon />} current={current}>
            <Label>Variants</Label>
        </LinkMenuItem>
    );
}
