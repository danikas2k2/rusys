import ChartIcon from '@assets/chart.svg';

import React from 'react';

import { Label } from '~/client/app/common/Label';
import { Links } from '~/client/app/Links';
import { LinkMenuItem, type LinkMenuItemProps } from '~/client/app/toolbar/items/LinkMenuItem';

export function SummaryItem({ current }: Pick<LinkMenuItemProps, 'current'>) {
    return (
        <LinkMenuItem link={Links.SUMMARY} icon={<ChartIcon />} color="blue" current={current}>
            <Label>Statistics</Label>
        </LinkMenuItem>
    );
}
