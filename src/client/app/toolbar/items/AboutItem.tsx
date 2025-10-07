import InfoIcon from '@assets/info.svg';

import React from 'react';

import { Label } from '~/client/app/common/Label';
import { Links } from '~/client/app/Links';
import { LinkMenuItem, type LinkMenuItemProps } from '~/client/app/toolbar/items/LinkMenuItem';

export function AboutItem({ current }: Pick<LinkMenuItemProps, 'current'>) {
    return (
        <LinkMenuItem link={Links.ABOUT} icon={<InfoIcon />} current={current}>
            <Label>About</Label>
        </LinkMenuItem>
    );
}
