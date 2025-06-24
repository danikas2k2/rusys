import React from 'react';
import InfoIcon from '@assets/info.svg';
import { Label } from '~/client/common/Label';
import { Links } from '~/client/Links';
import { LinkMenuItem, type LinkMenuItemProps } from '~/client/toolbar/items/LinkMenuItem';

export function AboutItem({ current }: Pick<LinkMenuItemProps, 'current'>) {
    return (
        <LinkMenuItem link={Links.ABOUT} icon={<InfoIcon />} current={current}>
            <Label>About</Label>
        </LinkMenuItem>
    );
}
